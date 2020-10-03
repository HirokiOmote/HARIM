<?php
  // Template Name: ショッピングガイド
  get_header();
?>


<main>
  <div class="p-wrapper">
    <div class="p-main">
      <section class="c-section">
        <h2 class="c-title-002">お支払い方法と手数料について</h2>

        <!-- <section id="pay001">
          <h3>代金引換 （現金でのお支払い)</h3>
          <p>ご配送先で現金と引き換えに商品を受け取ることができます。<br>
          （支払方法は現金のみとなります。クレジットカードはご使用になれません）<br>
          商品代金＋送料＋代引手数料を配達員にお支払いください。</p>

          <section>
            <h4>代金引換手数料について</h4>
            <p>ご注文には、商品代金（税込）に応じた手数料をいただきます。 （※すべて税込）</p>

            <dl>
              <dt>10,000円未満</dt>
              <dd>324円</dd>
              <dt>10,000円以上 〜 30,000円未満</dt>
              <dd>432円</dd>
              <dt>30,000円以上 〜 100,000円未満</dt>
              <dd>648円</dd>
            </dl>

            <p>代引手数料はお客様ご負担とさせていただいておりますので、予めご了承ください</p>
          </section>
        </section> -->

        <!-- <section class="c-section__inner" id="pay002">
          <h3>銀行振込</h3>
          <p>当店にて在庫を確認後にお送りする受注メールに記載された、振込先の口座（楽天銀行 / ゆうちょ銀行）に、ご注文より7日以内に合計金額をお振り込みください。<br>ご入金を確認後、商品を発送させて頂きます。</p>
          <p>購入者名義と、振込名義は同一のお名前でお願いします。<br>別名でのお振込の場合、確認に時間が必要となるため、対応が遅れる原因となります。</p>
          <p class="c-txt-note">お振込み手数料はお客様ご負担とさせていただいておりますので、予めご了承ください。</p>
        </section> -->

        <section class="c-section__inner" id="pay003">
          <h3>クレジットカード決済</h3>
          <p>ご購入手続きの際クレジットカードの諸情報をご入力ください。<br>
          ご利用いただけるカードは、下記の通りです。</p>

          <p>クレジットカードのご利用は商品代金2,000円（税込）以上の場合に限ります。</p>
          <p>決済画面を途中で閉じてしまったり、手続きがうまく完了出来なかった場合は、<a href="<?php echo home_url('contact'); ?>">お問い合わせフォーム</a>よりお問い合わせください。</p>
        </section>
      </section>

      <section class="c-section">
        <h2 class="c-title-002">配送方法について</h2>

        <secction class="c-section__inner" id="delivery001">
          <h3>運送会社について</h3>
          <p>商品の配送は「ヤマト運輸」に委託しております。<br>
          お買い上げ商品の合計金額が5,400円以上（税込）で送料無料となります（配送先一箇所につき）。</p>

          <section>
            <h4>基本送料</h4>
            <p>全国一律756円（税込）</p>
            <p>離島・一部地域へは追加料金がかかる場合がございます。</p>
          </section>
        </secction>

        <section class="c-section__inner" id="delivery002">
          <h3>お届けの日時指定について</h3>
          <p>配送方法が宅配便、大型宅配便の場合は次の中からお選びいただけます。</p>

          <ul class="p-list-guide">
            <li>午前便</li>
            <li>14時~16時</li>
            <li>16時~18時</li>
            <li>18時~20時</li>
            <li>19時~21時</li>
          </ul>
        </section>
      </section>

      <section class="c-section">
        <h2 class="c-title-002">商品について</h2>

        <p>オンラインショップでは、コレクションの商品を抜粋して販売しております。<br>
        ブログやSNSで掲載されていてもオンラインショップにはないものも多数ございます。<br>
        希望の商品がございましたら、お気軽に<a href="<?php echo home_url('contact'); ?>">お問い合わせ</a>ください。</p>
      </section>

      <section class="c-section">
        <h2 class="c-title-002">修理について</h2>

        <p><a href="<?php echo home_url('contact'); ?>">お問い合わせフォーム</a>よりご連絡ください。必要なお手続き、修理費用など、ご連絡致します。</p>
      </section>

      <section class="c-section">
        <h2 class="c-title-002">返品・交換について</h2>

        <section class="c-section__inner">
          <h3>商品の不良や破損、ご注文内容と異なる商品が届いた場合</h3>

          <p>大変申し訳ございませんが、お届け後7日以内のご連絡をお願いいたします。</p>
          <p>メールもしくはお電話で詳細内容を確認させて頂いた後、<br>
          交換の手配をさせていただきます。</p>

          <p>また、配送途中の破損事故がございましたら、お手数をおかけしますが、破損した商品は破棄せずに、まずはご連絡をお願いいたします。</p>

          <p>送料は当店負担で早急に再発送の手配をさせていただきます。<br>その際の応対で、運送会社の担当者からご連絡を差し上げる場合がございます。</p>
        </section>

        <section class="c-section__inner" id="return001">
          <h3>お客様都合による返品、交換</h3>
          <p>お客様のご都合による、返品・交換は承っておりません。</p>
        </section>

        <section class="c-section__inner">
          <h3>返品・交換に関するお問い合わせ・返送先</h3>

          <p>〒921-8032<br>石川県金沢市清川町10-25 1F</p>
          <p><a href="<?php echo home_url('contact'); ?>">お問い合わせフォーム</a></p>
        </section>
      </section>

      <section class="c-section">
        <h2 class="c-title-002">ご購入前の注意点</h2>

        <section class="c-section__inner" id="attention001">
          <h3>メールが届かない場合</h3>
          <p>ご注文をいただいた後の自動配信メールが届かないというケースが多く見られます。<br>
          携帯電話やhotmail、yahooなどのフリーメールアドレスをお使いの場合、<br>
          こちらからのご連絡が全て「迷惑メール」として処理される事がございますのでご注意ください。</p>

          <section>
            <h4>携帯電話からご注文のお客様</h4>
            <p>携帯電話からのご注文の際は、「PCからのメールの受信拒否」の設定を解除してください。<br>
            キャリアによっては「受信拒否を相手に知らせない」という仕様になっており、<br>
            その場合生活購買店reedでは、お客様にメールが届いていない事を知る事ができません。</p>
            <p>また、＠の前に「.」が入っているメールアドレスをお使いの場合、<br>
            こちらからメールを送信する事ができません。</p>
            <p>お買い物やお問い合わせの際は別のメールアドレスをご用意いただけますようお願いいたします。</p>
          </section>

          <section>
            <h4>フリーメールなどをご利用のお客様</h4>
            <p>hotmail、yahooなどのフリーメールアドレスをご利用の場合で、<br>
            ご注文後すぐに「注文確認メール」が届かなかった場合は、「迷惑メールフォルダ」内もご確認くださいませ。</p>
            <p>数日経過しても生活購買店reedからのお返事が届かない場合は、<br>
            上記のような理由でメールが届いていない可能性がございます。<br>
            再度ご確認の上、改めてメールをお送りいただくか、お急ぎの場合はお電話にてお問い合わせください。</p>
          </section>
        </section>

        <section class="c-section__inner">
          <h3>銀行振込に関して</h3>
          <p>ご入金後「入金確認メール」が届かない場合、恐れ入りますが「ご入金時のご名義」を今一度ご確認の上、<a href="<?php home_url('contact'); ?>">お問い合わせ</a>ページからご連絡下さいますようお願いいたします。</p>
        </section>
      </section>
    </div>

    <aside class="p-sidebar">
      <section class="p-section__sidebar">
        <h2 class="c-title-002">支払い方法・手数料</h2>
        <ul class="c-arrow-list">
          <!-- <li><a href="#pay001">代金引換</a></li> -->
          <!-- <li><a href="#pay002">銀行振込</a></li> -->
          <li><a href="#pay003">クレジットカード</a></li>
        </ul>
      </section>

      <section class="p-section__sidebar">
        <h2 class="c-title-002">配送方法</h2>
        <ul class="c-arrow-list">
          <li><a href="#delivery001">運送会社</a></li>
          <li><a href="#delivery002">日時指定</a></li>
        </ul>
      </section>

      <section class="p-section__sidebar">
        <h2 class="c-title-002">商品</h2>
        <ul class="c-arrow-list">
          <li><a href="#return001">返品・交換</a></li>
        </ul>
      </section>

      <section class="p-section__sidebar">
        <h2 class="c-title-002">注意点</h2>
        <ul class="c-arrow-list">
          <li><a href="#attention001">メールの未着</a></li>
        </ul>
      </section>
    </aside>
  </div>
</main>


<?php get_footer(); ?>
