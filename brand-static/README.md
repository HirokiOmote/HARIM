# HARIM brand 静的サイト

`https://harim.jp/` を配信する静的サイト。トップ・ABOUT・STOCK LIST を HTML/CSS/JavaScript にし、`www/brand` に配置しています。以前の WordPress テーマのソースは変更していません。

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

購入・会員は既存の外部ショップへ案内します。ブランドサイトに表示されていた `harim.stores.jp` は取得時に HTTP エラーを返したため、HARIM の商品とカテゴリーを確認できた `https://harimshop.net/` にリンクしています。カテゴリー ID は既存リンクと現在のショップで一致しました。

2026-10-22 JST の利用者の回答に従い、問い合わせフォームや問い合わせリンクは追加しません。

ブランドサイトの検索・アカウント・カートは元の SCSS でも非表示でした。静的版には WordPress のログインフォーム、カート、REST API 呼び出しを含めていません。外部ショップでの会員ログイン・注文は実行していません。既存 WordPress 会員のデータ移行は今回の対象外です。

## 調査結果（2026-10-22 JST）

切り替え前の HARIM の公開 HTML に WordPress 5.4.24 と WooCommerce 4.2.5 の generator がありました。SSH 接続後、`www/brand` に置いたランダム名の一時ファイルを `https://harim.jp/` で取得し、ドメインとの対応を確認しました。一時ファイルは確認後に削除しています。

切替前の MIRAH の公開 HTML には WordPress 4.9.26 の generator と `/wp-content/themes/mirah/` の参照がありました。`https://mirah.jp/wp-json/` は HTTP 200 の JSON を返し、`oembed/1.0`、`akismet/v1`、`wp/v2` の名前空間がありました。`/contact/` に POST フォームもありました。その後の静的化と公開記録は [MIRAH の README](../mirah-static/README.md) に記録しています。

## 検証（2026-10-22 JST）

`node build.mjs` と JavaScript 3ファイルの構文検査が通りました。生成物は18ファイル、合計1,790,678 bytesです。

Chrome で3ページを320・390・768・1440px幅で検査し、横はみ出し・画像欠落・内部リンク切れ・JavaScript エラー・外部リソース要求はありませんでした。見出しと ID、地域へのリンク、モバイルメニューの開閉と Escape 後のフォーカス、JavaScript 無効時のナビゲーションも確認しました。店舗本文とリンク先は取得した公開ページに一致しています。

問い合わせリンクの削除後に再ビルドし、生成済み3ページに問い合わせリンクがなく、オンラインショップへのリンクが残っていることを確認しました。

## 本番用ビルド

```sh
cd brand-static
node build.mjs --production
```

出力先は `dist-production/`。全ページの `noindex` を外し、クロールを許可する `robots.txt` と3ページの `sitemap.xml` を生成します。公開 URL は `https://harim.jp/` です。引数なしのビルドは引き続き `dist/` に検索対象外のプレビューを生成します。両方の出力は独立しているため、本番用ビルドでプレビューを上書きしません。`noindex` はアクセス制限ではありません。

本番用には `production.htaccess` も含めます。HTTPS・www なしの URL に統一し、旧 WordPress のページ ID、`index.php`、`home/`、使用中の画像9件の旧 URL を転送します。旧アカウント・カート・購入 URL は外部ショップへ案内し、クエリ文字列は渡しません。

旧 `/privacy-policy/` は HARIM ONLINE STORE 向けで、Google Analytics の利用にも言及していました。静的サイトではその記載を複製せず、現行ショップの `https://harimshop.net/privacy_policy` へ転送します。

## 本番反映（2026-10-22 JST）

利用者の画面確認と本番反映の承認後、15:00 JST に `www/brand` を静的版へ切り替えました。生成物20ファイル・1,792,819 bytesをサーバーへ送り、全ファイルの SHA-256 が一致しています。

- 切り替え前に、一時ディレクトリで Apache の転送・404・ディレクトリ一覧禁止の7件を検査し、確認後に削除しました。
- 公開 URL の46件を検査。3ページと全素材・検索用ファイルの内容、旧 URL の転送、存在しないページと WordPress の管理・設定 URL の404を確認しました。
- 公開後の Chrome で3ページを390・1440px幅で確認し、画像・フォント・リンク・メニュー・JavaScript 無効時のナビゲーションが動作しました。横はみ出し、JavaScript エラー、外部リソース要求はありませんでした。
- 切り替え前後で `mirah` と `shop` の `index.php`・`.htaccess` の SHA-256 が一致しました。

切替時、旧 brand のファイルをサーバーの `$HOME/.harim-backups/brand-20261022T060026Z-ce344906` に退避しました。公開領域外に置き、親ディレクトリを所有者のみアクセスできる権限にしました。この切替では DB を変更していません。

SFTP 接続を検証し、ローカルの `.vscode/sftp.json` に保存しました。Git 管理外、権限600、既存秘密鍵のファイル参照を使い、アップロード元は `brand-static/dist-production`、転送先は `www/brand` です。保存時の自動アップロードと同期時の削除は無効です。接続値はリポジトリに含めません。

公開後、利用者が `shop` と `staging` は未使用と確認し、削除を依頼しました。`www/shop` は `$HOME/.harim-backups/shop-20261022T060026Z-ce344906` に退避し、公開領域から削除しました。この処理の前後で brand の全配信ファイルと mirah の `index.php`・`.htaccess` の SHA-256 は一致し、DB は変更していません。

`www/staging` は存在しませんでした。旧 brand・旧 shop・ホーム直下の同名ディレクトリと、公開領域の浅い階層にある類似名も調べましたが、該当ディレクトリは見つかっていません。

## 旧 WordPress と DB の削除（2026-10-22 JST）

利用者から旧 WordPress と DB 内のデータを削除してよいとの指示を受け、16:09 JST に 71 テーブルを削除しました。旧 brand と shop は同一 DB・同一 prefix の 58 テーブルを共有し、MIRAH は別 DB の 13 テーブルを使っていました。両 DB の残存テーブルは 0 件です。DB 自体と DB ユーザーは残しています。

削除前に公開領域の WordPress 設定が 0 件であること、対象 DB に他用途のテーブル・VIEW・routine・event がないことを確認しました。DB の行データは取得せず、接続設定とテーブルの一覧をサーバー内部で照合しました。新しい DB ダンプは作成していません。

16:21 JST に旧 brand・shop・mirah の退避ディレクトリ 3 件の削除が完了しました。対象は合計 32,258 ファイル・1,103,283,249 bytes でした。旧 WordPress の退避ファイルと DB 内のデータは削除済みで、この退避先からは復旧できません。

削除後、公開中の HARIM 20 ファイルと MIRAH 22 ファイルの SHA-256 が生成物と一致しました。DB 削除後の両サイトの公開 URL 検査 56 件も通過しています。検証記録は Git 管理外の `mirah-static/.impeccable/cleanup/` に保存しています。

初回の読み取り調査は 180 秒でタイムアウトしました。削除処理を行う前に調査を再実行し、DB とテーブルの対応を確認しました。

## SEO の更新（2026-10-22 JST）

タイトル・description・OGP・Twitter Card・JSON-LD と画像サイトマップを追加した。下層ページにはパンくずを表示し、公開時の内部リンクと `index.html` の転送先を canonical URL に揃えた。本文・メタ情報の日本語は「アクセサリー」に修正した。

共通実装と検査記録は [静的サイトの SEO](../site-tools/README.md) を参照。

16:53 JST に SEO 更新を本番へ反映した。生成物 20 ファイル・1,806,135 bytes の SHA-256 が配置先と一致。両サイト合計 105 件の HTTP 検査が通過し、全 5 ページを Chrome の幅 390 / 1440px で再確認した。メタ情報・構造化データ・パンくず・画像・メニューに検査エラーはなかった。記録は Git 管理外の `.impeccable/seo/` に保存している。
