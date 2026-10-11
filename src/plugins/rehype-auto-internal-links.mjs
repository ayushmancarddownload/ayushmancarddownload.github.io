/**
 * Automatic internal linking (runs at build time on every blog post).
 *
 * For each post it looks through the *existing sentences* and turns a matching phrase into a link
 * to another post — no extra "read also: <title>" lines are added, the text stays exactly as written.
 * Because it runs on every build, a NEW post automatically gets linked from the OLD posts that already
 * talk about the same thing (and vice-versa), without touching any .md file.
 *
 * Phrases that point to a post (best first):
 *   1. `linkKeywords: [...]` in that post's frontmatter   <- most reliable, add short natural phrases here
 *   2. its title (and the part of the title before ":" "|" "—")
 *   3. the first **bold** phrases in its intro (usually the focus keyword)
 *   4. its tags (only multi-word or 7+ letter tags, so "tech" / "tips" never match everywhere)
 *
 * Safety rules (so it never looks spammy):
 *   - at most MAX_LINKS auto-links per post, 1 link per paragraph, 1 link per target post
 *   - only inside normal paragraph / list / table text — never in headings, code, bold, existing links, images
 *   - never links a post to itself; only links posts of the same `lang`; skips drafts
 *   - a post can opt out with `noAutoLink: true` (as a source, and as a target)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG_DIR = resolve(fileURLToPath(new URL('../content/blog/', import.meta.url)));
const DEFAULT_MAX_LINKS = 4;
const MIN_PHRASE_LEN = 4;

// never put a link inside these
const SKIP = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'script', 'style', 'button', 'img',
  'figcaption', 'summary', 'kbd', 'strong', 'b', 'nav', 'svg']);
// text must sit inside one of these blocks
const BLOCK = new Set(['p', 'li', 'td', 'th', 'blockquote']);

/* ---------- tiny frontmatter reader (no dependencies) ---------- */
const unquote = (v) => v.replace(/^(["'])([\s\S]*)\1$/, '$2').replace(/\\"/g, '"').trim();

function parseInlineArray(v) {
  const inner = v.slice(1, v.lastIndexOf(']'));
  const out = [];
  for (const m of inner.matchAll(/"((?:[^"\\]|\\.)*)"|'([^']*)'|([^,]+)/g)) {
    const item = (m[1] ?? m[2] ?? m[3] ?? '').trim();
    if (item) out.push(item.replace(/\\"/g, '"'));
  }
  return out;
}

function parseMarkdown(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      fm[key] = v === '' ? [] : v.startsWith('[') ? parseInlineArray(v) : unquote(v);
    } else if (key && Array.isArray(fm[key]) && /^\s*-\s+/.test(line)) {
      fm[key].push(unquote(line.replace(/^\s*-\s+/, '').trim()));
    }
  }
  return { fm, body: raw.slice(m[0].length) };
}

/* ---------- targets ---------- */
const len = (s) => [...s].length;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function phraseRegex(phrase) {
  const body = phrase.trim().split(/\s+/).map(esc).join('\\s+');
  // Unicode-aware "whole word" check (works for Hindi too, where \b does not)
  return new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])${body}(?![\\p{L}\\p{M}\\p{N}])`, 'giu');
}

function loadTargets() {
  const targets = [];
  let files = [];
  try { files = readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f)); } catch { return targets; }

  for (const file of files) {
    const { fm, body } = parseMarkdown(readFileSync(resolve(BLOG_DIR, file), 'utf8'));
    if (String(fm.draft) === 'true' || String(fm.noAutoLink) === 'true') continue;
    const slug = basename(file, extname(file));
    const phrases = new Map(); // phrase(lowercase) -> priority
    const add = (p, priority) => {
      const t = String(p ?? '').trim();
      if (len(t) < MIN_PHRASE_LEN) return;
      const k = t.toLowerCase();
      if (!phrases.has(k) || phrases.get(k).priority < priority) phrases.set(k, { text: t, priority });
    };

    (Array.isArray(fm.linkKeywords) ? fm.linkKeywords : []).forEach((k) => add(k, 4));
    if (fm.title) {
      add(fm.title, 3);
      add(String(fm.title).split(/\s*[:|—–]\s*/)[0], 3);
    }
    [...body.slice(0, 1500).matchAll(/\*\*([^*\n]{4,70})\*\*/g)].slice(0, 2).forEach((m) => add(m[1], 3));
    (Array.isArray(fm.tags) ? fm.tags : []).forEach((t) => {
      if (/\s/.test(t) || len(t) >= 7) add(t, 1);
    });

    if (!phrases.size) continue;
    targets.push({
      slug,
      lang: fm.lang || 'en',
      phrases: [...phrases.values()]
        .sort((a, b) => b.priority - a.priority || len(b.text) - len(a.text))
        .map((p) => ({ ...p, re: phraseRegex(p.text) })),
    });
  }
  return targets;
}

/* ---------- the plugin ---------- */
export default function rehypeAutoInternalLinks(options = {}) {
  const maxLinks = options.maxLinks ?? DEFAULT_MAX_LINKS;

  return (tree, file) => {
    const path = file?.path ? resolve(file.path) : '';
    if (!path.startsWith(BLOG_DIR + sep)) return; // blog posts only

    const fm = file.data?.astro?.frontmatter ?? {};
    if (fm.noAutoLink === true || fm.draft === true) return;
    const slug = basename(path, extname(path));
    const lang = fm.lang || 'en';

    const targets = loadTargets().filter((t) => t.slug !== slug && t.lang === lang);
    if (!targets.length) return;

    // 1. collect eligible text nodes in reading order
    const nodes = [];
    let blockCounter = 0;
    (function walk(parent, block) {
      for (const child of parent.children ?? []) {
        if (child.type === 'text') {
          if (block !== null && child.value.trim()) nodes.push({ node: child, parent, block });
        } else if (child.type === 'element') {
          if (SKIP.has(child.tagName)) continue;
          walk(child, BLOCK.has(child.tagName) ? ++blockCounter : block);
        }
      }
    })(tree, null);
    if (!nodes.length) return;

    // 2. for every target find where its best phrase occurs
    const candidates = [];
    for (const t of targets) {
      for (const phrase of t.phrases) {
        const hits = [];
        for (const n of nodes) {
          phrase.re.lastIndex = 0;
          let m;
          while ((m = phrase.re.exec(n.node.value)) && hits.length < 8) {
            hits.push({ n, start: m.index, end: m.index + m[0].length, text: m[0] });
            if (m[0].length === 0) phrase.re.lastIndex++;
          }
        }
        if (hits.length) {
          candidates.push({ slug: t.slug, score: phrase.priority * 1000 + len(phrase.text), hits });
          break; // best matching phrase for this target found
        }
      }
    }

    // 3. choose: best phrases first, one link per paragraph, up to maxLinks
    candidates.sort((a, b) => b.score - a.score);
    const usedBlocks = new Set();
    const chosen = [];
    for (const c of candidates) {
      if (chosen.length >= maxLinks) break;
      const hit = c.hits.find((h) => !usedBlocks.has(h.n.block));
      if (!hit) continue;
      usedBlocks.add(hit.n.block);
      chosen.push({ ...hit, slug: c.slug });
    }

    // 4. rewrite the text nodes: "…before [phrase] after…"
    const byNode = new Map();
    for (const c of chosen) byNode.set(c.n, [...(byNode.get(c.n) ?? []), c]);
    for (const [n, list] of byNode) {
      list.sort((a, b) => a.start - b.start);
      const pieces = [];
      let cursor = 0;
      for (const c of list) {
        if (c.start < cursor) continue;
        if (c.start > cursor) pieces.push({ type: 'text', value: n.node.value.slice(cursor, c.start) });
        pieces.push({
          type: 'element',
          tagName: 'a',
          properties: { href: `/blog/${c.slug}/` },
          children: [{ type: 'text', value: c.text }],
        });
        cursor = c.end;
      }
      if (cursor < n.node.value.length) pieces.push({ type: 'text', value: n.node.value.slice(cursor) });
      const idx = n.parent.children.indexOf(n.node);
      if (idx !== -1) n.parent.children.splice(idx, 1, ...pieces);
    }
  };
}
