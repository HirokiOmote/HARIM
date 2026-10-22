import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBreadcrumbs, renderSeoHead, renderSitemap } from './seo.mjs';

const site = {
  origin: 'https://example.test', name: 'SAMPLE', alternateName: 'サンプル',
  description: 'サンプルのアクセサリー。', logo: 'assets/logo.svg',
  sameAs: ['https://social.example.test/sample'],
  image: { path: 'assets/accessories.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'サンプルのリング' }
};
const home = {
  name: 'home', route: '', title: 'SAMPLE | アクセサリー', description: 'リングとネックレス。',
  schemaType: 'WebPage', images: ['assets/accessories.jpg']
};
const stores = {
  name: 'stocklist', route: 'stocklist/', title: '取扱店舗 | SAMPLE', description: '取扱店舗の一覧。',
  schemaType: 'CollectionPage', breadcrumb: 'STOCK LIST'
};

function graphFrom(head) {
  return JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
}

test('metadata escapes HTML and JSON-LD cannot terminate its script element', () => {
  const text = 'A & B "quoted" </script><img src=x>\u2028\u2029';
  const head = renderSeoHead({ ...site, name: text }, { ...home, title: text, description: text }, { production: true });
  assert.ok(head.includes('<title>A &amp; B &quot;quoted&quot; &lt;/script&gt;&lt;img src=x&gt;'));
  assert.ok(!head.includes('<img src=x>'));
  assert.equal((head.match(/<\/script>/g) ?? []).length, 1);
  const json = head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.ok(!/[<>&\u2028\u2029]/u.test(json));
  assert.equal(graphFrom(head).find(node => node['@type'] === 'WebPage').name, text);
});

test('production and preview have distinct indexing directives and the same canonical identity', () => {
  const production = renderSeoHead(site, home, { production: true });
  const preview = renderSeoHead(site, home, { production: false });
  assert.ok(production.includes('name="robots" content="index, follow, max-image-preview:large"'));
  assert.ok(!production.includes('noindex'));
  assert.ok(preview.includes('name="robots" content="noindex, nofollow"'));
  for (const head of [production, preview]) {
    assert.ok(head.includes('rel="canonical" href="https://example.test/"'));
    assert.ok(head.includes('property="og:image" content="https://example.test/assets/accessories.jpg"'));
    assert.ok(head.includes('property="og:locale" content="ja_JP"'));
    assert.ok(head.includes('name="twitter:card" content="summary_large_image"'));
    assert.ok(head.includes('name="twitter:image:alt" content="サンプルのリング"'));
  }
});

test('Brand, WebSite, page and its displayed primary image use connected IDs', () => {
  const graph = graphFrom(renderSeoHead(site, home, { production: true }));
  const brand = graph.find(node => node['@type'] === 'Brand');
  const website = graph.find(node => node['@type'] === 'WebSite');
  const page = graph.find(node => node['@type'] === 'WebPage');
  const image = graph.find(node => node['@type'] === 'ImageObject');
  assert.equal(brand.logo, 'https://example.test/assets/logo.svg');
  assert.equal(website.about['@id'], brand['@id']);
  assert.equal(page.about['@id'], brand['@id']);
  assert.equal(page.isPartOf['@id'], website['@id']);
  assert.equal(page.primaryImageOfPage['@id'], image['@id']);
  assert.equal(image.contentUrl, 'https://example.test/assets/accessories.jpg');
  assert.equal(image.width, 1200);
  assert.ok(!graph.some(node => ['Organization', 'Product', 'Offer', 'FAQPage'].includes(node['@type'])));
  assert.ok(!website.publisher);
});

test('stockists preserve separate locations, prefer names over addresses, and exclude hidden labels', () => {
  const content = `<a href="#tokyo">東京都</a><a href="https://example.test/about/">ABOUT</a>
    <a href="https://shop.example.test/?a=1&amp;b=2"><dl><dt>Shop &amp; One</dt><dd>公開住所</dd></dl><span class="visually-hidden">別タブ</span></a>
    <a href='https://shop.example.test/'><h3>Shop &#x32;</h3><p>別の公開住所</p></a>
    <a href="https://shop.example.test/">Shop &#51; <span class="help visually-hidden"><b>別タブ</b></span></a>
    <a href="mailto:info@example.test">メール</a><a href="javascript:void(0)">実行</a>
    <a href="https://other.example.test/"><span hidden>非表示</span><strong>Four</strong></a>`;
  const graph = graphFrom(renderSeoHead(site, stores, { production: true, content }));
  const list = graph.find(node => node['@type'] === 'ItemList');
  assert.equal(list.numberOfItems, 4);
  assert.deepEqual(list.itemListElement.map(item => item.name), ['Shop & One', 'Shop 2', 'Shop 3', 'Four']);
  assert.deepEqual(list.itemListElement.map(item => item.position), [1, 2, 3, 4]);
  assert.equal(list.itemListElement[0].url, 'https://shop.example.test/?a=1&b=2');
  const page = graph.find(node => node['@type'] === 'CollectionPage');
  assert.equal(page.mainEntity['@id'], list['@id']);
  assert.ok(!page.primaryImageOfPage);
  assert.ok(!graph.some(node => node['@type'] === 'ImageObject'));
});

test('visible breadcrumbs match JSON-LD and keep preview navigation usable', () => {
  const page = { ...stores, breadcrumb: 'SHOP & "STOCK"' };
  assert.equal(renderBreadcrumbs(site, home, './index.html'), '');
  const html = renderBreadcrumbs(site, page, '../index.html?x=1&y=2');
  assert.ok(html.includes('href="../index.html?x=1&amp;y=2"'));
  assert.ok(html.includes('>HOME</a>'));
  assert.ok(html.includes('aria-current="page">SHOP &amp; &quot;STOCK&quot;</li>'));
  const breadcrumb = graphFrom(renderSeoHead(site, page, { production: true })).find(node => node['@type'] === 'BreadcrumbList');
  assert.deepEqual(breadcrumb.itemListElement.map(item => [item.name, item.item]), [
    ['HOME', 'https://example.test/'], ['SHOP & "STOCK"', 'https://example.test/stocklist/']
  ]);
});

test('AboutPage does not acquire store data or a primary image from shared social metadata', () => {
  const about = { ...stores, route: 'about/', schemaType: 'AboutPage', breadcrumb: 'ABOUT' };
  const graph = graphFrom(renderSeoHead(site, about, {
    production: true, content: '<a href="https://shop.example.test/">External reference</a>'
  }));
  assert.ok(graph.some(node => node['@type'] === 'AboutPage'));
  assert.ok(!graph.some(node => ['ItemList', 'ImageObject'].includes(node['@type'])));
});

test('sitemap contains only canonical pages and their supplied images, with XML escaping', () => {
  const xml = renderSitemap(site, [{ ...home, images: ['assets/accessories.jpg', 'assets/accessories.jpg', 'assets/one.jpg?a=1&b=2'] }, stores]);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));
  assert.equal((xml.match(/<url>/g) ?? []).length, 2);
  assert.equal((xml.match(/<image:image>/g) ?? []).length, 2);
  assert.ok(xml.includes('<loc>https://example.test/stocklist/</loc>'));
  assert.ok(xml.includes('<image:loc>https://example.test/assets/one.jpg?a=1&amp;b=2</image:loc>'));
  assert.ok(!xml.includes('index.html'));
  assert.ok(!xml.includes('<lastmod>'));
  assert.ok(!xml.includes('<priority>'));
  assert.ok(!xml.includes('<changefreq>'));
});
