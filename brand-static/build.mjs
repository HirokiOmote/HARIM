import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist');
const site = 'https://harim.jp';
const shop = 'https://harimshop.net/';
const pages = [
  { name: 'home', route: '', title: 'HARIM - ハリム', description: 'アクセサリーブランド、HARIMのWebサイト。リングやネックレスをはじめとしたアイテムを制作しております。' },
  { name: 'about', route: 'about/', title: 'ABOUT | HARIM', heading: 'ABOUT', description: 'HARIMのブランド、デザイナー、ジュエリーの製作について。' },
  { name: 'stocklist', route: 'stocklist/', title: 'STOCK LIST | HARIM', heading: 'STOCK LIST', description: 'HARIMのお取り扱い店舗。' }
];

function template(page, content) {
  const base = page.route ? '../' : './';
  const navLink = (name, label) => `<a href="${base}${name}/index.html"${name === page.name ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${site}/${page.route}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="HARIM">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${site}/${page.route}">
  <link rel="icon" href="${base}assets/favicon.png" sizes="32x32">
  <link rel="apple-touch-icon" href="${base}assets/apple-touch-icon.png">
  <link rel="preload" href="${base}assets/crimson-text-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${base}site.css">
  <script src="${base}site.js" defer></script>
</head>
<body class="page-${page.name}">
  <a class="skip-link" href="#main">本文へ移動</a>
  <header class="site-header">
    <a class="brand" href="${base}index.html" aria-label="HARIM ホーム"><img src="${base}assets/logo.svg" alt="HARIM" width="128" height="28"></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" hidden>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      <span>メニュー</span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="メインメニュー">
      <a href="${shop}">ONLINE SHOP</a>
      ${navLink('about', 'ABOUT')}
      ${navLink('stocklist', 'STOCK LIST')}
    </nav>
  </header>
  <main id="main" tabindex="-1"${page.name === 'home' ? '' : ' class="content-page"'}>
    ${page.heading ? `<h1 class="page-title">${page.heading}</h1>` : ''}
    ${content}
  </main>
  <footer class="site-footer">
    <div class="footer-links">
      <div><h2>PAGE</h2><nav aria-label="ページ">${navLink('about', 'ABOUT')}${navLink('stocklist', 'STOCK LIST')}</nav></div>
      <div><h2>SNS</h2><nav aria-label="SNS"><a href="https://www.facebook.com/harim.info/">Facebook</a><a href="https://twitter.com/HARIMSILVER">Twitter</a><a href="https://www.instagram.com/harim_jewelry_official/">Instagram</a></nav></div>
      <div><h2>ONLINE SHOP</h2><nav aria-label="オンラインショップ"><a href="${shop}">オンラインショップ</a><a href="${shop}inquiry">お問い合わせ</a></nav></div>
    </div>
    <p class="copyright">© 2018 <a href="${base}index.html">HARIM</a>. All rights reserved.</p>
  </footer>
</body>
</html>
`;
}

// Only generated files under this project's dist directory are replaced.
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
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`Built ${pages.length} preview pages in brand-static/dist. Search indexing is disabled.`);
