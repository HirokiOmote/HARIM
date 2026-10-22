const schema = 'https://schema.org';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function decodeEntities(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
    if (!code.startsWith('#')) return named[code.toLowerCase()];
    const number = code[1].toLowerCase() === 'x'
      ? Number.parseInt(code.slice(2), 16)
      : Number.parseInt(code.slice(1), 10);
    return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
      ? String.fromCodePoint(number)
      : '\uFFFD';
  });
}

function attribute(attributes, name) {
  const expression = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\x60]+))`, 'i');
  const match = attributes.match(expression);
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3]) : undefined;
}

function visibleText(fragment) {
  const stack = [];
  const words = [];
  const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const tokens = fragment.match(/<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+|</g) ?? [];
  for (const token of tokens) {
    if (token.startsWith('<!--')) continue;
    const tag = token.match(/^<\s*(\/?)\s*([a-z][\w:-]*)\b([\s\S]*?)\/?\s*>$/i);
    if (!tag) {
      if (!stack.at(-1)?.hidden) words.push(decodeEntities(token));
      continue;
    }
    const [, closing, rawName, attributes] = tag;
    const name = rawName.toLowerCase();
    if (closing) {
      const position = stack.map(element => element.name).lastIndexOf(name);
      if (position >= 0) stack.splice(position);
      words.push(' ');
      continue;
    }
    const classes = (attribute(attributes, 'class') ?? '').split(/\s+/);
    const hidden = stack.at(-1)?.hidden || classes.includes('visually-hidden')
      || /(?:^|\s)hidden(?:\s|=|$)/i.test(attributes)
      || name === 'script' || name === 'style';
    if (!voidElements.has(name) && !/\/\s*>$/.test(token)) stack.push({ name, hidden });
    words.push(' ');
  }
  return words.join('').replace(/\s+/g, ' ').trim();
}

function externalItems(content, origin) {
  const items = [];
  for (const anchor of content.matchAll(/<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a\s*>/gi)) {
    const href = attribute(anchor[1], 'href');
    if (!href || !/^https?:\/\//i.test(href)) continue;
    let url;
    try { url = new URL(href); } catch { continue; }
    if (url.origin === origin) continue;
    const preferred = anchor[2].match(/<(dt|h3)\b[^>]*>([\s\S]*?)<\/\1\s*>/i);
    const name = visibleText(preferred ? preferred[2] : anchor[2]);
    if (name) items.push({ '@type': 'ListItem', position: items.length + 1, name, url: url.href });
  }
  return items;
}

function absolute(site, resource = '') {
  return new URL(resource, `${site.origin}/`).href;
}

function structuredData(site, page, content) {
  const url = absolute(site, page.route);
  const brandId = `${site.origin}/#brand`;
  const websiteId = `${site.origin}/#website`;
  const brand = {
    '@type': 'Brand', '@id': brandId, name: site.name,
    ...(site.alternateName ? { alternateName: site.alternateName } : {}),
    url: absolute(site), description: site.description,
    logo: absolute(site, site.logo), sameAs: site.sameAs
  };
  const website = {
    '@type': 'WebSite', '@id': websiteId, name: site.name,
    ...(site.alternateName ? { alternateName: site.alternateName } : {}),
    url: absolute(site), description: site.description, inLanguage: 'ja',
    about: { '@id': brandId }
  };
  const webpage = {
    '@type': page.schemaType ?? 'WebPage', '@id': `${url}#webpage`, url,
    name: page.title, description: page.description, inLanguage: 'ja',
    isPartOf: { '@id': websiteId }, about: { '@id': brandId }
  };
  const graph = [brand, website, webpage];
  if (page.route && page.breadcrumb) {
    const breadcrumbId = `${url}#breadcrumb`;
    webpage.breadcrumb = { '@id': breadcrumbId };
    graph.push({
      '@type': 'BreadcrumbList', '@id': breadcrumbId,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'HOME', item: absolute(site) },
        { '@type': 'ListItem', position: 2, name: page.breadcrumb, item: url }
      ]
    });
  }
  if ((page.images ?? []).includes(site.image.path)) {
    const imageId = `${url}#primaryimage`;
    webpage.primaryImageOfPage = { '@id': imageId };
    graph.push({
      '@type': 'ImageObject', '@id': imageId,
      url: absolute(site, site.image.path), contentUrl: absolute(site, site.image.path),
      width: site.image.width, height: site.image.height,
      encodingFormat: site.image.type, caption: site.image.alt
    });
  }
  if (page.schemaType === 'CollectionPage') {
    const items = externalItems(content, site.origin);
    if (items.length) {
      const listId = `${url}#stockists`;
      webpage.mainEntity = { '@id': listId };
      graph.push({
        '@type': 'ItemList', '@id': listId, name: page.title,
        itemListOrder: `${schema}/ItemListUnordered`, numberOfItems: items.length,
        itemListElement: items
      });
    }
  }
  return { '@context': schema, '@graph': graph };
}

export function renderSeoHead(site, page, { production, content = '' }) {
  const meta = (name, value, attributeName = 'name') => `<meta ${attributeName}="${name}" content="${escapeHtml(value)}">`;
  const image = absolute(site, site.image.path);
  const json = JSON.stringify(structuredData(site, page, content))
    .replace(/[<>&\u2028\u2029]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return [
    `<title>${escapeHtml(page.title)}</title>`,
    meta('description', page.description),
    meta('robots', production ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'),
    `<link rel="canonical" href="${escapeHtml(absolute(site, page.route))}">`,
    meta('og:type', 'website', 'property'),
    meta('og:site_name', site.name, 'property'),
    meta('og:title', page.title, 'property'),
    meta('og:description', page.description, 'property'),
    meta('og:url', absolute(site, page.route), 'property'),
    meta('og:locale', 'ja_JP', 'property'),
    meta('og:image', image, 'property'),
    meta('og:image:width', site.image.width, 'property'),
    meta('og:image:height', site.image.height, 'property'),
    meta('og:image:type', site.image.type, 'property'),
    meta('og:image:alt', site.image.alt, 'property'),
    meta('twitter:card', 'summary_large_image'),
    meta('twitter:title', page.title),
    meta('twitter:description', page.description),
    meta('twitter:image', image),
    meta('twitter:image:alt', site.image.alt),
    `<script type="application/ld+json">${json}</script>`
  ].join('\n  ');
}

export function renderBreadcrumbs(site, page, homeHref) {
  if (!page.route || !page.breadcrumb) return '';
  return `<nav class="breadcrumbs" aria-label="パンくず"><ol><li><a href="${escapeHtml(homeHref)}">HOME</a></li><li aria-current="page">${escapeHtml(page.breadcrumb)}</li></ol></nav>`;
}

export function renderSitemap(site, pages) {
  const urls = pages.map(page => {
    const images = [...new Set(page.images ?? [])].map(resource =>
      `    <image:image><image:loc>${escapeHtml(absolute(site, resource))}</image:loc></image:image>`);
    return ['  <url>', `    <loc>${escapeHtml(absolute(site, page.route))}</loc>`, ...images, '  </url>'].join('\n');
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
}
