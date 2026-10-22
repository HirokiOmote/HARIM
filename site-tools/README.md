# 静的サイトの SEO と AI 利用条件

HARIM と MIRAH のメタタグ、JSON-LD、パンくず、画像サイトマップを `seo.mjs` で生成する。ページごとのタイトル・説明・画像は各サイトの `build.mjs`、表示内容は `content/` が正本。

## 検索対象と URL

本番用ビルドは `index, follow, max-image-preview:large` を出力する。通常のプレビューは `noindex, nofollow` と `robots.txt` の `Disallow: /` を維持する。プレビューでも canonical と構造化データの ID は本番 URL を指す。

本番の内部リンクは `/`、`/about/`、`/stocklist/`、`/shoplist/` のディレクトリ URL に揃える。明示的に指定された `index.html` は 301 で転送する。Apache の `DirectoryIndex` による内部処理を転送するとループするため、`THE_REQUEST` でブラウザーからのリクエストだけを判定する。プレビューのリンクはファイルを直接開ける相対 URL のままとする。

## 構造化データ

- `Brand` と `WebSite` を `about` で接続し、各ページは `isPartOf` でサイトを参照する。HARIM の日本語名は「ハリム」。MIRAH の未確認の別名は追加していない。
- ブランド紹介は `AboutPage`、取扱店舗一覧は `CollectionPage` と `ItemList`。店舗名と URL は表示中のリンクから生成する。取扱店をブランド直営の `LocalBusiness` として扱わない。
- 下層ページには画面上のパンくずと一致する `BreadcrumbList` を付ける。
- `primaryImageOfPage` はそのページに表示する画像だけに付ける。OGP と Twitter Card は既存写真を共用し、画像のサイズ・形式・代替テキストも出力する。
- 商品価格・在庫・評価の情報をこのサイトでは管理していないため、`Product`、`Offer`、レビュー用のマークアップは追加しない。

日本語の分類・説明は「アクセサリー」に統一した。デザイナーの経歴は「装身具」と表記する。公式英語スローガン `this is (not) jewelry`、店舗固有名 `Jewelry Connection`、既存の SNS URL は原文を保持する。

サイトマップは公開中の 5 ページと実際に表示する画像を収録する。画像を差し替えたら `build.mjs` の `images` も更新する。更新履歴に基づかない `lastmod` は出力しない。

## 検査

```sh
node --test site-tools/seo.test.mjs
node brand-static/build.mjs
node brand-static/build.mjs --production
node mirah-static/build.mjs
node mirah-static/build.mjs --production
```

2026-10-22 JST、共通モジュールの 7 テストが通過。HTML・JSON・XML のエスケープ、店舗抽出、グラフの参照、パンくず、プレビューの検索除外を確認した。生成した画像サイトマップの 10 記載（HARIM 4、MIRAH 6）は、実ファイルと各ページの `src` / `srcset` に一致した。

Chrome の幅 320 / 390 / 1440px で全 5 ページを確認。横はみ出し、画像欠落、JavaScript エラーは 0 件。構造化データの店舗名・URL は DOM 上の HARIM 25 店、MIRAH 9 店と一致した。JavaScript 無効・ローカルファイル表示での 5 ページの移動も確認した。

検査中に MIRAH の画像ファイル名のハイフン不足と、掲載していない電話番号への description の言及を修正した。検索順位、Google の再クロール、検索結果での表示は未測定。Search Console への送信は行っていない。

設計の参照先: [Google の canonical の説明](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[パンくずの構造化データ](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)、[画像サイトマップ](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)、[Schema.org Brand](https://schema.org/Brand)。

## 本番反映（2026-10-22 JST）

16:53 JST、HARIM 20 ファイル・1,806,135 bytes、MIRAH 22 ファイル・4,492,923 bytes を反映した。切替前の全ファイルが事前記録と一致することを確認し、新旧双方のハッシュを照合してから公開先を切り替えた。

公開 URL の 105 件を検査し、全公開ファイルの内容一致、正規 URL と旧 WordPress URL の転送、HTTP/HTTPS と www の統一、404、ディレクトリ一覧の禁止を確認した。Chrome の幅 390 / 1440px で 5 ページを再確認し、検査エラーは 0 件だった。MIRAH の CONTACT と旧問い合わせ URL は利用者指定の外部 URL へ案内する。遷移先での問い合わせ送信は行っていない。

独立レビューでは未解決の指摘は 0 件。ローカル Apache 2.4.59 の転送検査は 28 件通過した。本番用配置スクリプトはダミー環境で 15 件を確認し、2 サイト目の切替失敗時の復旧、パス外への展開・リンク・重複ファイルの拒否を検査した。ローカル PHP 7.4 は依存ライブラリ不足で起動できなかったため、このダミー検査には PHP 8.5.6 を使い、本番の PHP 7.4.33 で配置とハッシュ検査が通ることを確認した。

## RSL による AI 利用条件

2026-10-22 JST の利用者指定に従い、文章は AI 学習・微調整、検索、索引、RAG、生成回答への入力、引用を許可する。画像は検索・索引・RAG・生成回答への入力・引用を許可し、AI 学習・微調整・学習データセットへの取り込みを禁止する。写真・ロゴ・アイコン・高解像度版と HTML 内に表示する画像も対象。

`rsl.mjs` が各サイトのページ一覧と画像 manifest から `rsl.xml` と日英の `ai-usage.txt` を生成する。本番のみ `robots.txt` 冒頭の `License:`、HTML の `rel="license"`、ページ・画像の HTTP `Link` から同じ XML を参照する。`rsl.xml` の Content-Type は `application/rsl+xml`。プレビューの検索除外は維持し、利用許可を発信しない。

対象パスは完全一致と query 付きに分ける。サイト全体の `/` や `/assets/` に一括で権利を付けると第三者のフォントや OFL 文書まで含めてしまうため、対象の文章ページ・画像だけを列挙する。HARIM は画像 9 件と旧 URL 9 件、MIRAH は画像 12 件と旧 URL 12 件。現在のページ一覧では HARIM 50、MIRAH 58 のパス規則となる。外部ショップのコンテンツには適用しない。

RSL の `ai-train` は画像だけ禁止し、`ai-input`・`ai-index`・`search` は許可する。全体を拒否する `robots.txt` の `Disallow`、`noimageindex`、独自の `noai` タグは追加しない。認証・課金・報告義務は設けない。RSL の再確認期間は 1 日。

画像を追加・差し替えた際は `assets/manifest.json` の `file`・`source_url`・`mime_type` も更新する。`image/*` のエントリーが現画像と同一ドメインの旧 URL の規則に変換される。文章ページを追加した際は `build.mjs` の `pages` が規則の生成元となる。

```sh
node --test site-tools/rsl.test.mjs
```

RSL は対応クライアントに利用条件を伝える仕組みで、非対応クローラーの取得や学習を技術的に阻止するものではない。画像を使う RAG・検索を残すため、画像取得自体の遮断は行っていない。

仕様: [RSL 1.0](https://rslstandard.org/rsl)、[公式検証画面](https://rslstandard.org/validate)。

2026-10-22 JST、RSL helper の 7 テストと、公式検証画面での両サイト XML の検査が通過した。独立した XML 照合でも全 108 規則が対象パス・利用条件と一致。Apache 2.4.59 の HTTP 検査 132 件では、現在・旧画像 URL のヘッダー、XML の Content-Type、対象外ファイルへの非付与を確認した。

初回の Apache 検査では旧画像 URL の 301 応答に `Link` が付かなかった。削除済みのパスへの転送では `FilesMatch` 内のヘッダー設定が働かなかったため、画像だけは `REQUEST_URI` 条件で付与する形に修正した。全 5 ページの body と既存 25 素材のバイト列は SEO 公開時と同じで、表示の変更はない。
