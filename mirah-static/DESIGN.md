---
name: MIRAH
description: 既存の MIRAH サイトから引き継いだ写真・ロゴ・配色・配置
colors:
  paper: "#fafafa"
  ink: "#333"
  rule: "#dad2d2"
  white: "white"
  mobile-navigation: "rgb(255 255 255 / 94%)"
  mobile-menu: "rgb(255 255 255 / 97%)"
typography:
  body:
    fontFamily: "-apple-system, Karla, BlinkMacSystemFont, 'Segoe UI', Avenir, 'Helvetica Neue', Helvetica, Arial, YuGothic, 'Hiragino Kaku Gothic Pro', Meiryo, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "normal"
  page-title:
    fontSize: "24px"
    fontWeight: 700
    letterSpacing: "0.2em"
  page-title-wide:
    fontSize: "30px"
    fontWeight: 700
    letterSpacing: "0.2em"
  region-title:
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.5
  retailer-name:
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.5
  retailer-name-wide:
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.5
  retailer-detail:
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
spacing:
  content-top: "55px"
  photo-top: "55px"
  region-gap: "60px"
  page-gutter: "15px"
  page-gutter-wide: "30px"
components:
  navigation-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "7px 0"
  menu-toggle:
    textColor: "{colors.ink}"
    backgroundColor: "transparent"
    width: "44px"
    height: "44px"
    padding: "10px"
  menu-toggle-open:
    backgroundColor: "{colors.paper}"
  region-title:
    textColor: "{colors.ink}"
    typography: "{typography.region-title}"
    padding: "0 0 10px"
---

# Design System: MIRAH

## Overview

既存の MIRAH サイトを静的 HTML に移すための記録。新しいブランドや画面構成は定義しない。基準は公開元の CSS・HTML・画像と、表示完了後の SHOP LIST の画面。旧ホームの白画面の撮影結果は、表示開始処理が完了していないため基準にしない。

ネックレスと花のメイン画像、白・黒の MIRAH ロゴ、左右非対称に置く着用写真を引き継ぐ。画面の文字はメニューと店舗情報を中心にし、写真の上に新しい説明文を加えない。

## Colors

ページ背景は `paper`、本文・メニュー・フォーカス枠は `ink`、店舗の区分見出しの罫線は `rule`。SHOP LIST のメイン見出しには `white` を使う。モバイルの固定メニューと開閉パネルは白の半透明背景を使う。

SHOP LIST の見出しは写真の明るい部分と重なり、局所的なコントラスト不足がある。これは既存の見た目を保持した箇所で、適合済みの配色例として転用しない。検証結果は [README.md](README.md) に記録する。

## Typography

全体で `body` のフォント指定を継承する。先頭は OS のシステムフォントで、Karla を必ず使う指定ではない。Karla は通常体・ウェイト 400・Latin の WOFF2 をローカルに置き、`font-display: swap` で読む。日本語は利用環境のフォントへフォールバックする。

SHOP LIST の見出しは `page-title`、店舗の区分名は `region-title`、店名は `retailer-name`、住所と URL は `retailer-detail`。幅 768px 以上では見出しと店名に `-wide` の値を使う。著作権表記は 10px、幅 1024px 以上は 13px。店名・URL が長い場合は折り返す。

## Layout

メイン画像はホームで高さ 80svh、SHOP LIST で 50svh とし、`vh` の代替指定も持つ。幅 768px 以上では、それぞれ 720px・300px を上限とする。画像は中央を基準に `cover` で配置する。ホームの白ロゴはモバイルで中央、幅 1024px 以上では上部左寄せ。

本文は最大 980px。幅 1024px 以上では全体を最大 1400px に収め、左側 26.9% をメニュー用に空ける。メニューは本文の上端から 55px の位置に置き、スクロール時も画面上端から 55px に留まる。狭い画面では左右に `page-gutter` を取り、JavaScript が有効なときだけ上端に固定メニューを置く。

ホームの先頭 2 枚は縦長写真と正方形写真を横並びにし、各幅を最大 48%、間隔を 4% とする。続く横長写真は右寄せ、最後の写真は左寄せ。写真間は `photo-top` を使い、元画像の縦横比を保つ。

店舗一覧は幅 768px 未満で 1 列、以上で 2 列。店舗間は縦 20px・横 30px、区分間は `region-gap`。区分見出しの下から店舗までは 20px、幅 768px 以上は 30px。フッターは上下 89px の余白を取り、黒ロゴと著作権表記を中央に置く。

## Elevation & Depth

影は使わない。区分間の余白と細い罫線で店舗情報を分ける。モバイルの固定メニューは半透明の白背景で写真に重ねる。

## Shapes

写真・罫線・パネルは四角形。写真に角丸や装飾枠を足さない。メニューボタンは枠線なしの四角い操作領域に、細い 3 本線を置く。

## Components

### ロゴと写真

`assets/logo.svg` は白、`assets/logo-black.svg` は黒の既存ロゴ。メイン画像は `hero.jpg` と `hero@2x.jpg`、本文は `top-01` から `top-04` の各 1x・2x を使う。SVG の描き直し、画像の再生成・再圧縮は行っていない。ホーム 2 枚目は元 HTML の `srcset` に合わせて `top-02` とする。

### メニュー

項目と順序は ONLINE SHOP / SHOP LIST / Instagram / CONTACT。デスクトップでは左に縦並び。現在のページとホバー中のリンクは下線で示す。リンクとボタンのキーボードフォーカスは 2px の枠を 5px 離して表示する。

幅 1024px 未満では高さ 44px の固定バーに黒ロゴとメニューボタンを置く。開閉パネルはバーの直下から左側に表示し、幅 80vw・最大 340px、内側余白 20px。リンクの高さは最低 44px とし、長い一覧はパネル内でスクロールする。

Escape で閉じるとボタンにフォーカスが戻る。メニュー外へのクリック・フォーカス移動でも閉じる。JavaScript が無効ならボタンは表示せず、通常のリンク一覧を残す。開閉や写真表示にアニメーションは設定しない。

### 店舗一覧

区分名の下に 1px の罫線を置き、その下に店名・住所・URL を並べる。カードの背景・枠・影は付けない。店舗全体をリンクとし、URL は常に下線、ホバー時は店名にも下線を付ける。写真・店舗情報の順序と文言は公開元に従う。

## Do's and Don'ts

- **Do** 公開元のロゴ・写真・配色・店舗情報を基準にする。
- **Do** 画面幅を変えても写真の順序と左右非対称の配置を保つ。
- **Do** JavaScript 無効時も本文とページ間のリンクを使える状態にする。
- **Don't** 新しい写真、ロゴ、ブランドの説明文を追加して移行の範囲を広げる。
- **Don't** 表示開始アニメーションの完了を写真の表示条件にする。
- **Don't** 写真上の白文字を、コントラスト確認済みの組み合わせとして扱う。
