const namespace = 'https://rslstandard.org/rsl';
const textUses = 'search ai-train ai-input ai-index';
const imageUses = 'search ai-input ai-index';

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  })[character]);
}

function patterns(pathname) {
  const literal = pathname.replace(/\*/g, '%2A').replace(/\$/g, '%24');
  return [`${literal}$`, `${literal}?*`];
}

function contentTerms(pattern, terms, image) {
  return [
    `  <content url="${escapeXml(pattern)}">`,
    '    <license>',
    `      <permits type="usage">${image ? imageUses : textUses}</permits>`,
    ...(image ? ['      <prohibits type="usage">ai-train</prohibits>'] : []),
    '    </license>',
    `    <terms>${escapeXml(terms)}</terms>`,
    '  </content>'
  ].join('\n');
}

export function renderRsl(site, pages, manifest) {
  const origin = new URL(site.origin).origin;
  const textPaths = new Set(['/ai-usage.txt']);
  for (const page of pages) {
    const canonical = new URL(page.route, `${origin}/`).pathname;
    textPaths.add(canonical);
    textPaths.add(`${canonical}index.html`);
  }

  const imagePaths = new Set();
  for (const asset of manifest.assets) {
    if (!/^image\//i.test(asset.mime_type)) continue;
    imagePaths.add(new URL(`assets/${asset.file}`, `${origin}/`).pathname);
    const source = new URL(asset.source_url);
    if (source.origin === origin) imagePaths.add(source.pathname);
  }

  const terms = `${origin}/ai-usage.txt`;
  const contents = [
    ...[...textPaths].flatMap(pathname => patterns(pathname).map(pattern => contentTerms(pattern, terms, false))),
    ...[...imagePaths].flatMap(pathname => patterns(pathname).map(pattern => contentTerms(pattern, terms, true)))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rsl xmlns="${namespace}" max-age="1">\n${contents.join('\n')}\n</rsl>\n`;
}

export function renderAiUsage(site) {
  const origin = new URL(site.origin).origin;
  return `${site.name} 文章・画像のAI利用条件
対象サイト: ${origin}/

文章
本サイトの文章は、AIモデルの学習・微調整、検索、AIシステムの索引作成、RAG（検索拡張生成）、生成回答への入力、引用に利用できます。

画像
写真、ロゴ、アイコン、高解像度版を含む本サイトの画像を、AIモデルの学習・微調整、学習用データセットへの取り込みに利用することは禁止します。HTML内に表示・埋め込みされた画像や、文章と一緒に取得された画像にも同じ条件が適用されます。
画像の検索、AIシステムの索引作成、RAG、生成回答への入力、引用への利用は許可します。

適用範囲
第三者のフォントとそのライセンス文書には、それぞれの既存ライセンスが適用されます。リンク先の外部ショップなど、対象サイト以外のコンテンツにはこの条件を適用しません。
この条件は上記の利用を許可するもので、著作権その他の権利を放棄するものではありません。

AI use of text and images
Scope: ${origin}/
Text may be used for AI training and fine-tuning, search, AI indexing, retrieval-augmented generation (RAG), generative responses, and quotation.
Images, including photographs, logos, icons, and high-resolution versions, must not be used for AI training, fine-tuning, or inclusion in training datasets. This restriction also applies to images displayed or embedded in HTML or collected together with text. Image search, AI indexing, RAG, use in generative responses, and quotation are permitted.
Third-party fonts and their license documents retain their existing licenses. These terms do not apply to external shops or other linked sites and do not waive copyright or other rights.

RSL: ${origin}/rsl.xml
`;
}
