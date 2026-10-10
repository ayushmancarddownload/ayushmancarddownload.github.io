// Broken internal link checker. Runs on the built site (dist/) at the end of `npm run build`.
//  - A link to a page that doesn't exist  -> ERROR  (build fails)
//  - A missing image / script / css file  -> warning (build continues; e.g. cover images you haven't uploaded yet)
//  - A #fragment that doesn't exist on the target page -> warning
// Set LINKCHECK_WARN_ONLY=1 to never fail the build.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, posix, extname } from 'node:path';

const DIST = resolve('dist');
const ORIGIN = 'https://postbnao.com';
const WARN_ONLY = process.env.LINKCHECK_WARN_ONLY === '1';

if (!existsSync(DIST)) {
  console.error('check-links: dist/ not found — run the build first.');
  process.exit(WARN_ONLY ? 0 : 1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const decodeEntities = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const idCache = new Map();

function resolveTarget(urlPath) {
  const p = safeDecode(urlPath);
  const base = join(DIST, p);
  if (p.endsWith('/')) return existsSync(join(base, 'index.html')) ? join(base, 'index.html') : null;
  if (existsSync(base) && statSync(base).isFile()) return base;
  if (existsSync(join(base, 'index.html'))) return join(base, 'index.html');
  if (existsSync(base + '.html')) return base + '.html';
  return null;
}

function idsOf(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    const ids = new Set();
    for (const m of html.matchAll(/\s(?:id|name)=(?:"([^"]*)"|'([^']*)')/g)) ids.add(m[1] ?? m[2]);
    idCache.set(file, ids);
  }
  return idCache.get(file);
}

const errors = [];
const warnings = [];
const missingAssets = new Map(); // file -> number of references

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const pageUrl = '/' + posix.relative(DIST.replaceAll('\\', '/'), file.replaceAll('\\', '/')).replace(/index\.html$/, '');
  const where = pageUrl === '/' ? '/' : pageUrl;

  const refs = []; // { raw, kind: 'page' | 'asset' }
  for (const m of html.matchAll(/<a\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')/gi)) refs.push({ raw: m[1] ?? m[2], kind: 'page' });
  for (const m of html.matchAll(/<(?:img|script|source|video|audio)\b[^>]*?\ssrc=(?:"([^"]*)"|'([^']*)')/gi)) refs.push({ raw: m[1] ?? m[2], kind: 'asset' });
  for (const m of html.matchAll(/\ssrcset=(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const part of (m[1] ?? m[2]).split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (u) refs.push({ raw: u, kind: 'asset' });
    }
  }
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = /\srel=["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
    if (!/stylesheet|icon|manifest|preload/i.test(rel)) continue;
    const href = /\shref=["']([^"']*)["']/i.exec(tag)?.[1];
    if (href) refs.push({ raw: href, kind: 'asset' });
  }

  for (const { raw, kind } of refs) {
    let ref = decodeEntities(raw).trim();
    if (!ref || /^(mailto:|tel:|javascript:|data:|blob:|sms:)/i.test(ref)) continue;
    if (ref.startsWith(ORIGIN)) ref = ref.slice(ORIGIN.length) || '/';
    if (/^(https?:)?\/\//i.test(ref)) continue; // external

    const [beforeHash, hash] = ref.split('#');
    const pathPart = beforeHash.split('?')[0];

    let target;
    if (!pathPart) target = file; // "#section" on this same page (also fixes 404.html, which isn't <dir>/index.html)
    else if (pathPart.startsWith('/')) target = resolveTarget(pathPart);
    else target = resolveTarget(posix.resolve(pageUrl.endsWith('/') ? pageUrl : posix.dirname(pageUrl) + '/', pathPart));

    if (!target || !existsSync(target)) {
      if (kind === 'page') errors.push(`${where}  ->  ${raw}  (page not found)`);
      else {
        const k = safeDecode(pathPart);
        missingAssets.set(k, (missingAssets.get(k) ?? 0) + 1);
      }
      continue;
    }
    if (hash && kind === 'page' && extname(target) === '.html' && !idsOf(target).has(safeDecode(hash))) {
      warnings.push(`${where}  ->  ${raw}  (anchor "#${hash}" not found on target page)`);
    }
  }
}

const uniq = (a) => [...new Set(a)];
if (missingAssets.size) {
  console.log(`\n${missingAssets.size} missing file(s) (images etc. — warning only, upload them to public/):`);
  [...missingAssets].forEach(([f, n]) => console.log(`  ! ${f}  (used ${n}x)`));
}
console.log(`check-links: scanned ${htmlFiles.length} pages`);
if (warnings.length) {
  console.log(`\n${uniq(warnings).length} warning(s):`);
  uniq(warnings).slice(0, 60).forEach((w) => console.log('  ! ' + w));
  if (uniq(warnings).length > 60) console.log(`  … and ${uniq(warnings).length - 60} more`);
}
if (errors.length) {
  console.error(`\n${uniq(errors).length} BROKEN INTERNAL LINK(S):`);
  uniq(errors).forEach((e) => console.error('  x ' + e));
  if (!WARN_ONLY) {
    console.error('\nBuild stopped. Fix the links above (or set LINKCHECK_WARN_ONLY=1 to continue anyway).');
    process.exit(1);
  }
} else {
  console.log('No broken internal links.');
}
