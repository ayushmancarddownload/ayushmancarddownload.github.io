// Tells Bing, Yandex & other IndexNow search engines about new / updated posts.
// Runs from GitHub Actions after every deploy (see .github/workflows/deploy.yml).
// It reads the LIVE sitemap and submits only URLs whose <lastmod> is within the last 2 days
// (set INDEXNOW_ALL=1 to submit every URL). It never fails the workflow.
import { readFileSync } from 'node:fs';

const cfg = readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8');
const SITE_URL = /url:\s*'(https?:\/\/[^']+)'/.exec(cfg)?.[1];
const KEY = /INDEXNOW_KEY\s*=\s*'([a-f0-9]{8,128})'/.exec(cfg)?.[1];

if (!SITE_URL || !KEY) {
  console.log('indexnow: could not read SITE.url / INDEXNOW_KEY from src/config.ts — skipping.');
  process.exit(0);
}

const host = new URL(SITE_URL).host;
const WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

try {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();

  const urls = [];
  for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?<\/url>/g)) {
    const [, loc, lastmod] = m;
    if (process.env.INDEXNOW_ALL === '1') urls.push(loc);
    else if (lastmod && Date.now() - new Date(lastmod).getTime() <= WINDOW_MS) urls.push(loc);
  }

  if (!urls.length) {
    console.log('indexnow: nothing new in the last 2 days — nothing to submit.');
    process.exit(0);
  }

  const body = { host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList: urls.slice(0, 10000) };
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log(`indexnow: submitted ${body.urlList.length} URL(s) -> HTTP ${r.status}`);
  if (r.status >= 400) console.log(await r.text());
} catch (err) {
  console.log('indexnow: skipped —', err.message);
}
process.exit(0);
