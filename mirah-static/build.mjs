import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (args.some(argument => argument !== '--production')) {
  console.error('Usage: node build.mjs [--production]');
  process.exit(1);
}
const production = args.includes('--production');
const outputDirectory = production ? 'dist-production' : 'dist';
const output = path.join(root, outputDirectory);
const site = 'https://mirah.jp';
const inquiry = 'https://mirah-store.com/inquiry';
const pages = [
  { name: 'home', route: '', title: 'MIRAH', description: 'MIRAHのジュエリーとお取り扱い店舗。' },
  { name: 'shoplist', route: 'shoplist/', title: 'SHOP LIST | MIRAH', description: 'MIRAHのお取り扱い店舗。' }
];

function template(page, content) {
  const base = page.route ? '../' : './';
  const home = page.name === 'home';
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  ${production ? '' : '<meta name="robots" content="noindex, nofollow">'}
  <link rel="canonical" href="${site}/${page.route}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MIRAH">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${site}/${page.route}">
  <meta property="og:image" content="${site}/assets/hero.jpg">
  <link rel="icon" href="${base}assets/logo-black.svg" type="image/svg+xml">
  <link rel="preload" href="${base}assets/karla-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${base}site.css">
  <script src="${base}site.js" defer></script>
</head>
<body class="page-${page.name}">
  <a class="skip-link" href="#main">本文へ移動</a>
  <header class="hero${home ? '' : ' hero--page'}">
    <img class="hero-image" src="${base}assets/hero.jpg" srcset="${base}assets/hero.jpg 1x, ${base}assets/hero@2x.jpg 2x" alt="" width="1750" height="875" fetchpriority="high">
    <h1 class="hero-title">${home ? `<img src="${base}assets/logo.svg" alt="MIRAH" width="124" height="46">` : 'SHOP LIST'}</h1>
  </header>
  <div class="layout">
    <aside class="sidebar">
      <nav class="navigation" aria-label="メインメニュー">
        <a class="brand" href="${base}index.html" aria-label="MIRAH ホーム"><img src="${base}assets/logo-black.svg" alt="MIRAH" width="124" height="46"></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" hidden>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M2 5h20M2 12h20M2 19h20"/></svg>
          <span class="visually-hidden">メニュー</span>
        </button>
        <ul class="menu" id="site-menu">
          <li><a href="https://mirah-store.com/" target="_blank" rel="noopener">ONLINE SHOP</a></li>
          <li><a href="${base}shoplist/index.html"${home ? '' : ' aria-current="page"'}>SHOP LIST</a></li>
          <li><a href="https://www.instagram.com/mirah_silver_official/" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="${inquiry}">CONTACT</a></li>
        </ul>
      </nav>
    </aside>
    <main class="content" id="main" tabindex="-1"${home ? ' aria-label="MIRAHのジュエリー"' : ''}>
${content}
    </main>
  </div>
  <footer class="site-footer">
    <a href="${base}index.html" aria-label="MIRAH ホーム"><img src="${base}assets/logo-black.svg" alt="MIRAH" width="70" height="26"></a>
    <p><small>(C) 2018 MIRAH</small></p>
  </footer>
</body>
</html>
`;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
for (const name of ['site.css', 'site.js']) await cp(path.join(root, name), path.join(output, name));
for (const page of pages) {
  const content = await readFile(path.join(root, 'content', `${page.name}.html`), 'utf8');
  const destination = path.join(output, page.route);
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, 'index.html'), template(page, content));
}
await writeFile(path.join(output, 'robots.txt'), production
  ? `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
if (production) {
  const urls = pages.map(page => `  <url><loc>${site}/${page.route}</loc></url>`).join('\n');
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  let routing = await readFile(path.join(root, 'production.htaccess'), 'utf8');
  const manifest = JSON.parse(await readFile(path.join(root, 'assets/manifest.json'), 'utf8'));
  for (const asset of manifest.assets) {
    const source = new URL(asset.source_url);
    if (source.origin !== site) continue;
    const pattern = source.pathname.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    routing += `RewriteRule ^${pattern}$ /assets/${asset.file} [R=301,L,QSD]\n`;
  }
  await writeFile(path.join(output, '.htaccess'), routing);
}
console.log(`Built ${pages.length} ${production ? 'production' : 'preview'} pages in mirah-static/${outputDirectory}.`);
