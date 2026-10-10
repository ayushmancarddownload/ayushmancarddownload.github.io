// Build-time image optimizer.
// Scans public/images (jpg/jpeg/png/webp), writes small responsive WebP variants to
// public/images/_opt/ and a manifest (src/data/image-manifest.json) used by <Img />.
// You keep uploading normal images to public/images/... — nothing else to do.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'public', 'images');
const OPT_DIR = path.join(SRC_DIR, '_opt');
const MANIFEST = path.join(ROOT, 'src', 'data', 'image-manifest.json');

const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SKIP = (name) => /^(og-|logo)/i.test(name); // social/schema images stay untouched
const WIDTHS_DEFAULT = [480, 800, 1200];
const WIDTHS_AVATAR = [96, 224];
const QUALITY = 72;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '_opt' ? [] : walk(p);
    return [p];
  });
}

function pickWidths(base, origW) {
  const ws = base.filter((w) => w < origW);
  const last = Math.min(origW, base[base.length - 1]);
  if (!ws.includes(last)) ws.push(last);
  return ws;
}

const manifest = {};
let made = 0;
let reused = 0;

for (const file of walk(SRC_DIR)) {
  const ext = path.extname(file).toLowerCase();
  if (!EXT.has(ext) || SKIP(path.basename(file))) continue;

  const rel = path.relative(SRC_DIR, file).split(path.sep).join('/'); // posts/foo.jpg
  const key = '/images/' + rel;
  const stem = rel.slice(0, -ext.length) + '-' + ext.slice(1); // posts/foo-jpg
  const isAvatar = rel.startsWith('authors/');

  try {
    const img = sharp(file, { failOn: 'none' }).rotate();
    const meta = await sharp(file, { failOn: 'none' }).rotate().metadata();
    // after rotate(), metadata() still reports raw dims; swap for 90/270° EXIF orientations
    const swap = meta.orientation && meta.orientation >= 5;
    const origW = swap ? meta.height : meta.width;
    const origH = swap ? meta.width : meta.height;
    if (!origW || !origH) continue;

    const widths = pickWidths(isAvatar ? WIDTHS_AVATAR : WIDTHS_DEFAULT, origW);
    const srcMtime = fs.statSync(file).mtimeMs;

    for (const w of widths) {
      const out = path.join(OPT_DIR, `${stem}-${w}.webp`);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcMtime) {
        reused++;
        continue;
      }
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 4 }).toFile(out);
      made++;
    }

    // average colour → shown as placeholder background while the image loads
    const { dominant } = await sharp(file, { failOn: 'none' }).resize(32).stats();
    const hex = '#' + [dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, '0')).join('');

    manifest[key] = { w: origW, h: origH, c: hex, v: widths, d: '/images/_opt/' + stem };
  } catch (err) {
    console.warn(`[optimize-images] skipped ${rel}: ${err.message}`);
  }
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[optimize-images] ${Object.keys(manifest).length} image(s), ${made} variant(s) written, ${reused} up to date`);
