# HARIM brand 静的プレビュー

`www/brand` の作り直しに向けたプレビュー。既存の WordPress テーマと分け、トップ・ABOUT・STOCK LIST を HTML/CSS/JavaScript にしました。本番サーバーは変更していません。

## 起動

Node.js 20 以上を使います。パッケージのインストールは不要です。

```sh
cd brand-static
node build.mjs
node preview.mjs
```

`http://127.0.0.1:4173/` を開きます。別のポートを使う場合は `PORT=4174 node preview.mjs`。停止は Ctrl+C。

出力先は `dist/`。`dist/index.html` はブラウザーで直接開くこともできます。下層ページと画像には相対 URL を使っています。

## 引き継いだ内容

- `https://harim.jp/` のロゴ、羽根リング、3カテゴリーの写真、Instagram ロゴ。
- `/about/` のブランド・デザイナー・製作方法の本文。
- `/stocklist/` の10地域・25件。ローカルの `src/shoplist.php` と差があるため、取得時点の公開ページを使いました。各店舗の営業状況は再調査していません。
- 既存 SCSS で指定されている Crimson Text。Latin フォントと OFL ライセンスを同梱し、ABOUT 本文などの日本語には OS の明朝体を使います。

画像・フォントの取得元と SHA-256 は `assets/manifest.json` に記録しています。本文は `content/`、共通ヘッダーとフッターは `build.mjs` で管理します。

WordPress の出力を丸ごと保存すると、非表示の会員フォームや `localhost` を指すデモリンクも残ります。そのため、画面に表示される内容を使って HTML を組み直しました。

## 購入・会員・問い合わせ

プレビューは、購入・会員を既存の外部ショップで扱う前提です。ブランドサイトに表示されていた `harim.stores.jp` は取得時に HTTP エラーを返したため、HARIM の商品とカテゴリーを確認できた `https://harimshop.net/` にリンクしています。問い合わせ先は同ショップの `/inquiry` です。カテゴリー ID は既存リンクと現在のショップで一致しました。

ブランドサイトの検索・アカウント・カートは元の SCSS でも非表示でした。静的版には WordPress のログインフォーム、カート、REST API 呼び出しを含めていません。外部ショップでの会員ログイン・注文・問い合わせ送信は実行していません。既存 WordPress 会員の利用状況は本番切り替え前の確認事項です。

## 調査結果（2026-10-22 JST）

HARIM の公開 HTML に WordPress 5.4.24 と WooCommerce 4.2.5 の generator がありました。`www/brand` と `https://harim.jp/` のサーバー設定上の対応は、この環境に接続設定がなく未確認です。

MIRAH の公開 HTML には WordPress 4.9.26 の generator と `/wp-content/themes/mirah/` の参照があります。`https://mirah.jp/wp-json/` は HTTP 200 の JSON を返し、`oembed/1.0`、`akismet/v1`、`wp/v2` の名前空間がありました。`/contact/` に POST フォームもあります。WordPress の構成が確認できる一方、HTML を毎回 PHP で生成しているか、キャッシュを配信しているかは公開応答だけでは確定していません。

## 検証（2026-10-22 JST）

`node build.mjs` と JavaScript 3ファイルの構文検査が通りました。生成物は18ファイル、合計1,790,864 bytesです。

Chrome で3ページを320・390・768・1440px幅で検査し、横はみ出し・画像欠落・内部リンク切れ・JavaScript エラー・外部リソース要求はありませんでした。見出しと ID、地域へのリンク、モバイルメニューの開閉と Escape 後のフォーカス、JavaScript 無効時のナビゲーションも確認しました。店舗本文とリンク先は取得した公開ページに一致しています。

## 本番切り替え前

この出力はプレビュー用です。全ページの `noindex, nofollow` と `robots.txt` の全拒否を付けています。本番用の出力を作る際は、確認済みの公開 URL に合わせてこれらを変更してください。`noindex` はアクセス制限ではありません。

本番切り替えには、完成画面の確認、`www/brand` のドメイン設定、既存 WordPress 会員の扱い、3ページ以外の既存 URL と転送方針の確認が残っています。`www/mirah`・`www/shop` は対象外です。
