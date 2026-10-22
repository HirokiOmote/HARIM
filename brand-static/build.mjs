import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderSeoHead, renderBreadcrumbs, renderSitemap } from '../site-tools/seo.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (args.some(argument => argument !== '--production')) {
  console.error('Usage: node build.mjs [--production]');
  process.exit(1);
}
const production = args.includes('--production');
const outputDirectory = production ? 'dist-production' : 'dist';
const output = path.join(root, outputDirectory);
const site = {
  origin: 'https://harim.jp', name: 'HARIM', alternateName: 'ハリム',
  description: 'アクセサリーブランド、HARIM（ハリム）。リング、ネックレス、ブレスレットをはじめ、年齢や流行、文化に囚われないデザインを追求しています。',
  logo: 'assets/logo.svg',
  sameAs: ['https://www.facebook.com/harim.info/', 'https://twitter.com/HARIMSILVER', 'https://www.instagram.com/harim_jewelry_official/'],
  image: { path: 'assets/necklaces.jpg', width: 1280, height: 720, type: 'image/jpeg', alt: 'HARIMのネックレス' }
};
const shop = 'https://harimshop.net/';
const pages = [
  { name: 'home', route: '', title: 'HARIM（ハリム）公式サイト | アクセサリーブランド', description: site.description, schemaType: 'WebPage', images: ['assets/owl-feather.png', 'assets/necklaces.jpg', 'assets/rings.jpg', 'assets/bracelets.jpg'] },
  { name: 'about', route: 'about/', title: 'ブランドについて | HARIM（ハリム）', heading: 'ABOUT', breadcrumb: 'ABOUT', description: 'HARIM（ハリム）のブランド名の由来、デザイナー、アクセサリーの製作について。普遍的なモチーフに現代のエッセンスを取り入れたデザインと、原型製作の考え方を紹介します。', schemaType: 'AboutPage' },
  { name: 'stocklist', route: 'stocklist/', title: '取扱店舗 | HARIM（ハリム）', heading: 'STOCK LIST', breadcrumb: 'STOCK LIST', description: 'HARIM（ハリム）のアクセサリーを取り扱う店舗とオンラインショップの一覧。地域ごとの店舗名、所在地、各店舗のWebサイトをご確認いただけます。', schemaType: 'CollectionPage' }
];

function template(page, content) {
  const base = page.route ? '../' : './';
  const homeHref = production ? '/' : `${base}index.html`;
  const navLink = (name, label) => `<a href="${production ? `/${name}/` : `${base}${name}/index.html`}"${name === page.name ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderSeoHead(site, page, { production, content })}
  <link rel="icon" href="${base}assets/favicon.png" sizes="32x32">
  <link rel="apple-touch-icon" href="${base}assets/apple-touch-icon.png">
  <link rel="preload" href="${base}assets/crimson-text-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${base}site.css">
  <script src="${base}site.js" defer></script>
</head>
<body class="page-${page.name}">
  <a class="skip-link" href="#main">本文へ移動</a>
  <header class="site-header">
    <a class="brand" href="${homeHref}" aria-label="HARIM ホーム"><img src="${base}assets/logo.svg" alt="HARIM" width="128" height="28"></a>
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
    ${renderBreadcrumbs(site, page, homeHref)}
    ${page.heading ? `<h1 class="page-title">${page.heading}</h1>` : ''}
    ${content}
  </main>
  <footer class="site-footer">
    <div class="footer-links">
      <div><h2>PAGE</h2><nav aria-label="ページ">${navLink('about', 'ABOUT')}${navLink('stocklist', 'STOCK LIST')}</nav></div>
      <div><h2>SNS</h2><nav aria-label="SNS"><a href="https://www.facebook.com/harim.info/">Facebook</a><a href="https://twitter.com/HARIMSILVER">Twitter</a><a href="https://www.instagram.com/harim_jewelry_official/">Instagram</a></nav></div>
      <div><h2>ONLINE SHOP</h2><nav aria-label="オンラインショップ"><a href="${shop}">オンラインショップ</a></nav></div>
    </div>
    <p class="copyright">© 2018 <a href="${homeHref}">HARIM</a>. All rights reserved.</p>
  </footer>
</body>
</html>
`;
}

// Replace only the selected build's generated directory.
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
  ? `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
if (production) {
  await cp(path.join(root, 'production.htaccess'), path.join(output, '.htaccess'));
  await writeFile(path.join(output, 'sitemap.xml'), renderSitemap(site, pages));
}
console.log(`Built ${pages.length} ${production ? 'production' : 'preview'} pages in brand-static/${outputDirectory}. Search indexing is ${production ? 'enabled' : 'disabled'}.`);
