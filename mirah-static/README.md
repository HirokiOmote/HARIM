# MIRAH 静的版

`https://mirah.jp/` の WordPress サイトを、既存の画像・配色・構成・店舗情報を残して静的 HTML に移した。利用者のリリース指示を受け、2026-10-22 15:50 JST に本番を切り替えた。

ホームと SHOP LIST の 2 ページを生成する。SHOP LIST は公開元の 8 区分・9 店舗を収録。CONTACT は利用者指定の `https://mirah-store.com/inquiry` へ移動する。

## ローカルで確認する

Node.js 20 以上を使う。追加パッケージのインストールは不要。

```sh
cd mirah-static
node build.mjs
node preview.mjs
```

`http://127.0.0.1:4174/` を開く。サーバーを使わず、生成後の `dist/index.html` を直接開いてもページ間を移動できる。終了は `Ctrl+C`。ポートを変える場合は `PORT=4175 node preview.mjs` とする。

通常のビルド先は `dist/`。HTML の `noindex, nofollow`、`robots.txt` の `Disallow: /`、プレビューサーバーの `X-Robots-Tag` で検索登録を抑止する。各ビルドは対象の出力ディレクトリを作り直すため、修正は生成元に加える。

## 生成元

| ファイル | 内容 |
| --- | --- |
| `build.mjs` | 共通 HTML、ページ情報、出力先、公開用ファイルの生成 |
| `content/home.html` | ホームの 4 枚の写真 |
| `content/shoplist.html` | 区分・店名・住所・店舗 URL |
| `site.css` | 配色、文字、写真の配置、画面幅ごとの表示 |
| `site.js` | モバイルメニューの開閉とフォーカス制御 |
| `assets/manifest.json` | 取得元 URL、取得日時、ファイルサイズ、SHA-256 |
| `production.htaccess` | 公開時の URL 転送規則 |
| `DESIGN.md` | 実装済みの見た目と保持する条件 |

画像・ロゴ・フォント・フォントライセンスの計 14 ファイルを公開サイトと Google Fonts の公開元から取得した。元のバイト列を保持し、加工・再圧縮していない。Karla のライセンスは `assets/fonts-OFL.txt` に収録。取得情報の正本は `assets/manifest.json`。

## 移行時の扱い

- ネックレスと花のメイン画像、白・黒の MIRAH ロゴ、左右非対称の 4 枚の写真、デスクトップの左メニュー、店舗情報を保持した。
- 元の AOS と表示開始アニメーションへの依存を外した。画像は初期状態から表示でき、JavaScript が無効でも写真とページ間のリンクを使える。旧ホームの撮影結果には遷移途中の白画面があるため、再現の基準には使っていない。
- 元のホーム 2 枚目は `src` が `img_top001.jpg`、`srcset` が `img_top002.jpg` だった。実際の表示に合わせ、静的版では両方を `top-02` に揃えた。
- モバイルメニューは 44px の操作領域を持つボタンに変更し、開閉状態の読み上げ、Escape で閉じた後のフォーカス復帰、領域外のクリック・フォーカス移動による閉鎖に対応した。JavaScript 無効時は通常のリンク一覧を表示する。
- 店舗リンクのホバー時は文字を薄くせず店名に下線を付ける。本文へのスキップリンクとキーボードのフォーカス表示を加えた。
- WordPress のお問い合わせフォームは複製していない。非公開のフォーム値は取り込んでいない。公開ページとして確認した SHOP LIST は ID 25、CONTACT は ID 4。初期投稿の「Hello world」はメインメニューの対象外。

## 公開用の出力

```sh
node build.mjs --production
```

`dist-production/` に検索登録可能な HTML、`robots.txt`、`sitemap.xml`、Apache 用の `.htaccess` を生成する。このコマンドはファイル生成だけを行い、アップロードや公開先の切替は行わない。公開 URL と canonical は `https://mirah.jp/` を前提にしている。

| 旧 URL・条件 | 生成する転送先 |
| --- | --- |
| HTTP または `mirah.jp` 以外のホスト | `https://mirah.jp/` の同一パス |
| `/?page_id=25`、`/index.php?page_id=25` | `/shoplist/` |
| `/?page_id=4`、`/index.php?page_id=4` | `https://mirah-store.com/inquiry` |
| `/contact/`、`/contact/index.html` | `https://mirah-store.com/inquiry` |
| `/index.php` | `/` |
| manifest に記録した旧画像 URL 12 件 | 対応する `/assets/` 内のファイル |

転送は 301。画像の規則は manifest から自動生成する。本番の `.htaccess` による転送とクエリ除去は、切替後に公開 URL で確認した。

## 本番への反映

2026-10-22 15:50 JST、`dist-production/` の 22 ファイルを `www/mirah` に配置した。転送後の SHA-256 を照合してから、同じファイルシステム内のディレクトリ移動で切り替えた。

切替時、旧 WordPress を `$HOME/.harim-backups/mirah-20261022T064949Z-6135cf3c` に退避した。公開領域外に置き、親ディレクトリの権限を `700` にした。旧 `index.php` と `.htaccess` の SHA-256 は切替前と一致した。この切替では DB の変更・削除を行っていない。

公開後の確認では、ページ・素材の内容一致、CONTACT と旧画像 URL の転送、HTTP から HTTPS への転送、旧 WordPress パスの 404、assets 一覧の 403 など、HTTP 検査 54 件が通過した。HARIM の公開ファイル 20 件は切替前後で一致した。

Chrome の幅 1440 / 390px で本番 2 ページの画像・フォント・内部リンク・メニュー操作を確認し、横方向のはみ出し、JavaScript エラー、表示時の外部リソース要求は検出されなかった。JavaScript 無効時も画像とリンクを確認した。本番の検証記録と画面は Git 管理外の `.impeccable/production/` に保存している。

2026-10-22 16:09 JST、利用者の削除指示を受けて MIRAH の旧 DB の 13 テーブルを削除し、残存テーブル 0 件を確認した。DB 自体と DB ユーザーは残している。16:21 JST に上記の退避ディレクトリも削除したため、旧 WordPress の復旧用データはこの退避先に残っていない。削除後も公開中の 22 ファイルの SHA-256 は生成物と一致した。HARIM・旧 shop を含む削除の記録は [HARIM の README](../brand-static/README.md#旧-wordpress-と-db-の削除2026-10-22-jst) に記録している。

## 検証記録

2026-10-22 JST 確認。

| 出力 | ファイル数 | 合計バイト数 |
| --- | ---: | ---: |
| `dist/` | 20 | 4,482,382 |
| `dist-production/` | 22 | 4,484,341 |

2 ページを幅 320 / 390 / 768 / 1024 / 1440px で確認。横方向のはみ出し、画像の読み込み失敗、ローカルリンクの不整合、JavaScript エラー、表示時の外部リソース要求は検出されなかった。メニューの Escape・フォーカス操作、JavaScript 無効時のリンク、ローカルファイルでのページ移動も確認した。取得ファイル 14 件のサイズと SHA-256 は manifest と一致した。

差分の空白検査は、原文のバイト列を保持した OFL ライセンスの21行目にある末尾空白1件を除いて通過した。

検証結果は [checks.json](.impeccable/review/checks.json)。画面記録は [ホーム・デスクトップ](.impeccable/review/home-desktop.png)、[ホーム・モバイル](.impeccable/review/home-mobile.png)、[SHOP LIST・デスクトップ](.impeccable/review/shoplist-desktop.png)、[SHOP LIST・モバイル](.impeccable/review/shoplist-mobile.png)。`.impeccable/` と生成先は Git 管理外。

SHOP LIST の白い見出しは、元サイトと同じく明るいペンダント部分に重なる。背景の一部を採取した白文字とのコントラスト比はデスクトップで約 1.85:1、モバイルで約 1.73:1。検出器は背景を `#fafafa` と誤認しているが、写真上にもコントラストが低い箇所は残る。WCAG 適合確認済みとは扱わない。既存の見た目を保持する今回の移行では必須修正にせず、課題として記録した。

CONTACT の URL は利用者指定。自動取得では HTTP 403 またはキャッシュ未取得となり、遷移先フォームの表示・問い合わせ送信は未検証。別担当の完了レビューでは、ローカル確認版の引き渡しに必要な修正はなかった。

切替前の公開準備では、`mirah.jp` の一時フォルダーに公開用の転送設定と `noindex` の確認用 HTML を置き、取得内容の一致で配置先を確認した。Apache 上で `page_id=25`、`page_id=4`、CONTACT の転送とクエリ除去、旧画像 URL の転送、assets 一覧の 403、存在しないパスの 404、確認用ルートの 200 の計 7 件を確認した。一時フォルダーは削除済み。この事前確認では既存の `.htaccess` と `index.php` の SHA-256 は作業前後で一致した。

## SEO の更新（2026-10-22 JST）

タイトル・description・OGP・Twitter Card・JSON-LD と画像サイトマップを追加した。下層ページにはパンくずを表示し、公開時の内部リンクと `index.html` の転送先を canonical URL に揃えた。本文・メタ情報の日本語は「アクセサリー」に修正した。

共通実装と検査記録は [静的サイトの SEO](../site-tools/README.md) を参照。

16:53 JST に SEO 更新を本番へ反映した。生成物 22 ファイル・4,492,923 bytes の SHA-256 が配置先と一致。両サイト合計 105 件の HTTP 検査が通過し、全 5 ページを Chrome の幅 390 / 1440px で再確認した。メタ情報・構造化データ・パンくず・画像・メニューに検査エラーはなかった。記録は Git 管理外の `.impeccable/seo/` に保存している。
