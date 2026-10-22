import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAiUsage, renderRsl } from './rsl.mjs';

const site = { origin: 'https://example.test', name: 'SAMPLE' };
const pages = [{ route: '' }, { route: 'about/' }];
const manifest = {
  assets: [
    { file: 'photo.jpg', source_url: 'https://example.test/old/photo.jpg', mime_type: 'image/jpeg' },
    { file: 'photo@2x.jpg', source_url: 'https://example.test/old/photo@2x.jpg', mime_type: 'image/jpeg' },
    { file: 'logo.svg', source_url: 'https://example.test/old/logo.svg', mime_type: 'image/svg+xml' },
    { file: 'icon.png', source_url: 'https://cdn.example.test/icon.png', mime_type: 'image/png' },
    { file: 'font.woff2', source_url: 'https://fonts.example.test/font.woff2', mime_type: 'font/woff2' },
    { file: 'fonts-OFL.txt', source_url: 'https://fonts.example.test/OFL.txt', mime_type: 'text/plain' },
    { file: 'site.css', source_url: 'https://example.test/site.css', mime_type: 'text/css' },
    { file: 'site.js', source_url: 'https://example.test/site.js', mime_type: 'text/javascript' }
  ]
};

function contentBlocks(xml) {
  return [...xml.matchAll(/<content url="([^"]+)">([\s\S]*?)<\/content>/g)]
    .map(([, pattern, terms]) => ({
      pattern: pattern.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      terms
    }));
}

function matches(pattern, request) {
  const end = pattern.endsWith('$');
  const literal = end ? pattern.slice(0, -1) : pattern;
  const expression = literal.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
  return new RegExp(`^${expression}${end ? '$' : ''}`).test(request);
}

test('text scopes cover canonical pages, index aliases and query variants without licensing other paths', () => {
  const xml = renderRsl(site, pages, manifest);
  const texts = contentBlocks(xml).filter(block => !block.terms.includes('<prohibits'));
  assert.equal(texts.length, 10);
  for (const request of ['/', '/?utm_source=test', '/index.html', '/index.html?x=1', '/about/', '/about/?x=1', '/about/index.html', '/about/index.html?x=1', '/ai-usage.txt', '/ai-usage.txt?x=1']) {
    assert.equal(texts.filter(block => matches(block.pattern, request)).length, 1, request);
  }
  for (const request of ['/assets/photo.jpg', '/about/photo.jpg', '/about/index.html.backup', '/ai-usage.txt.bak', '/site.css', '/site.js', '/assets/font.woff2', '/assets/fonts-OFL.txt']) {
    assert.equal(texts.filter(block => matches(block.pattern, request)).length, 0, request);
  }
  assert.ok(texts.every(block => block.terms.includes('<permits type="usage">search ai-train ai-input ai-index</permits>')));
});

test('all local and legacy image URLs forbid training while retaining search, RAG and AI indexing', () => {
  const images = contentBlocks(renderRsl(site, pages, manifest)).filter(block => block.terms.includes('<prohibits'));
  assert.equal(images.length, 14);
  for (const path of ['/assets/photo.jpg', '/old/photo.jpg', '/assets/photo@2x.jpg', '/old/photo@2x.jpg', '/assets/logo.svg', '/old/logo.svg', '/assets/icon.png']) {
    for (const request of [path, `${path}?version=2`]) {
      const applicable = images.filter(block => matches(block.pattern, request));
      assert.equal(applicable.length, 1, request);
      assert.ok(applicable[0].terms.includes('<permits type="usage">search ai-input ai-index</permits>'));
      assert.ok(applicable[0].terms.includes('<prohibits type="usage">ai-train</prohibits>'));
    }
  }
  assert.ok(!images.some(block => matches(block.pattern, '/assets/photo.jpg.backup')));
});

test('non-image assets and external source paths receive no RSL grant', () => {
  const xml = renderRsl(site, pages, manifest);
  const blocks = contentBlocks(xml);
  for (const path of ['/assets/font.woff2', '/assets/fonts-OFL.txt', '/assets/site.css', '/assets/site.js', '/icon.png']) {
    assert.ok(!blocks.some(block => matches(block.pattern, path)), path);
  }
  assert.ok(!xml.includes('https://cdn.example.test/'));
  assert.ok(!xml.includes('https://fonts.example.test/'));
});

test('RSL uses its namespace, one-day revalidation and the same human-readable terms without extra obligations', () => {
  const xml = renderRsl(site, pages, manifest);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<rsl xmlns="https://rslstandard.org/rsl" max-age="1">'));
  assert.ok(contentBlocks(xml).every(block => block.terms.includes('<terms>https://example.test/ai-usage.txt</terms>')));
  assert.ok(!xml.includes('server='));
  assert.ok(!xml.includes('<payment'));
  assert.ok(!xml.includes('<legal'));
  assert.ok(!xml.includes('ai-all'));
});

test('XML special characters and literal filename wildcards do not broaden the image scope', () => {
  const xml = renderRsl(site, [], { assets: [
    { file: 'ring&chain*.jpg', source_url: 'https://example.test/old/cost$&ring.jpg', mime_type: 'image/jpeg' }
  ] });
  assert.ok(xml.includes('url="/assets/ring&amp;chain%2A.jpg$"'));
  assert.ok(xml.includes('url="/old/cost%24&amp;ring.jpg$"'));
  assert.ok(!xml.includes('url="/assets/ring&chain'));
  assert.ok(!xml.includes('url="/old/cost$'));
});

test('duplicate page or image entries cannot create alternative grants', () => {
  const xml = renderRsl(site, [...pages, pages[0]], { assets: [...manifest.assets, manifest.assets[0]] });
  const patterns = contentBlocks(xml).map(block => block.pattern);
  assert.equal(new Set(patterns).size, patterns.length);
  assert.equal((xml.match(/<license>/g) ?? []).length, patterns.length);
});

test('human-readable Japanese and English terms describe embedded images and preserve third-party licenses', () => {
  const text = renderAiUsage(site);
  assert.ok(text.includes('SAMPLE 文章・画像のAI利用条件'));
  assert.ok(text.includes('対象サイト: https://example.test/'));
  assert.ok(text.includes('写真、ロゴ、アイコン、高解像度版'));
  assert.ok(text.includes('学習用データセットへの取り込み'));
  assert.ok(text.includes('HTML内に表示・埋め込みされた画像'));
  assert.ok(text.includes('画像の検索、AIシステムの索引作成、RAG、生成回答への入力、引用への利用は許可'));
  assert.ok(text.includes('第三者のフォントとそのライセンス文書'));
  assert.ok(text.includes('Text may be used for AI training and fine-tuning'));
  assert.ok(text.includes('These terms do not apply to external shops'));
  assert.ok(text.includes('do not waive copyright or other rights'));
  assert.ok(text.endsWith('RSL: https://example.test/rsl.xml\n'));
});
