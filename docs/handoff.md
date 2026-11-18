# 引き継ぎ（2026-11-18 時点、動きの段階2のあと）

ポートフォリオ（`apps/web`）の作業がどこまで進んでいて、何が残っているかをまとめる。使い方や中身の足し方は [README](../README.md) の「ポートフォリオ（`apps/web`）」にある。ここには書かない。

## いまの状態

- デザイン（Figma）、設計書、実装まで終わっている。`apps/web` は Astro から Nuxt 4 + Motion for Vue に移した（[動きと Nuxt への移行の設計書](superpowers/specs/2026-11-18-portfolio-motion-design.md)の段階1）。
- `vp run check` はエラーなし、`vp test` は 257/257 件が通る。
- 動きの段階2（登場演出、あいさつ、パソコンのポインター）まで入っている。使い方と重さは README の「登場演出、あいさつ、ポインター」にある。
- Vercel の `hp-v2` は `main` を本番として書き出す。ただし、まだ `ut42tech.com` を付けていない。今のドメインは `ut42tech-hp-v2.vercel.app` だけで、Vercel の認証で保護されている。

## できていること

- **デザイン**: Figma の [ut42tech — Portfolio](https://www.figma.com/design/ZPaC9SNAfMyKTROfRvAJyT) でスマホとパソコンの全画面、ライトとダーク、部品とトークンを確定した。
- **設計書**: [構造](superpowers/specs/2026-11-16-portfolio-wireframe-design.md)、[見た目](superpowers/specs/2026-11-17-portfolio-visual-design.md)、[動きと Nuxt への移行](superpowers/specs/2026-11-18-portfolio-motion-design.md)（食い違いは最後のものが優先）。
- **動き（段階1）**: スマホのシートは指に付いてきて、払った勢いで閉じるかを決め、離した速さを引き継ぐ。タブを切り替えるとシートが一度しまわれてから上がる。Apps の詳細はシート1枚で上がり、裏の一覧が奥へ下がる。どの動きも途中で次の操作を受け付ける。Safari の端スワイプでは動きを二重にしない。
- **ページ**: Hello、Works（Apps・Career・Events・Awards）、Apps の詳細、About（連絡先を含む）、Press。
- **見た目**: トークン（`packages/tokens`）、黒いナビバー、表示の切り替え（ライト・ダーク。ボタンから円で広がる）、Works の並べ替え、メールアドレスのコピー。
- **スマホとパソコン**: 同じ HTML を 1024px で出し分ける。スマホの詳細はナビバーの上に重なるシートになる。回転や幅の変更で 1024px をまたいでも追従する。
- **多言語**: `/ja/` と `/en/` の URL、辞書、言語の切り替え。英語は訳がそろうまで書き出さない。
- **検索エンジン向け**: canonical と hreflang（絶対 URL）。
- **動きを減らす設定**: シートと詳細はばねを使わず 150ms で切り替え、タブの切り替えはしまわずにその場で入れ替える。
- **404 と OGP**: 404 は Hello と同じ地に「404」と戻るリンク（検索エンジンには載せない）。OGP は全ページ共通の1枚（`packages/assets/og.png`。Hello の画面を 1200×630 で書き出し、下の行だけ大きくした）。
- **外部リンクの「↗」**: 外へ移るカード（Press、URL のある Events）と Apps の詳細のボタンに付ける。SNS のボタンには付けない（本人の決定）。
- **ハードコードの禁止**: SVG、文言、色を部品に直接書かないことをテストで見張っている。
- **中身**: 旧サイトの素材から 25 件を移した（Apps、Career、Events、Awards、Press）。

## できていないこと

### 1. `ut42tech.com` での公開

`hp-v2` に `ut42tech.com` を付ける（README の「サブドメインを追加する」と同じ手順で、Vercel にドメインを足し、Cloudflare の DNS を向ける）。**細かい調整と中身（下の 2）がすべて終わってから**公開する（本人の決定）。その前にセキュリティレビュー（下の 4）もやり直す。

### 2. 公開前に本人が書くもの

README の「公開前に本人が書くもの」にまとめてある。要点だけ挙げる。

- About の自己紹介と「これまで」（今は「（仮）」の文）
- Press の記事（素材に無かった分）と「長崎のWA!」のインタビューの URL
- Apps の技術スタック（`stack`。今は空）
- Career の終了月

### 3. 本人に確認したいこと

- **インターンの終了月**: 素材に無かったので、終了月を開始月と同じにした。「BrightJ 長期インターン 2023.05」のように、1か月だけに見える。

### 4. 後回しにした不具合と改善

最終レビューで見つかった細かい点。どれも公開を止めるほどではない。

- **フォント**: LINE Seed JP の CSS が重い（gzip 後で約 211KB）。今は気にしないことにした（本人の判断）。
- **細かい点**:
  - Skills のタイルのリストの意味づけ（`li role="img"`）
  - アクセシビリティのテストが浅い
  - Skills の一覧が2か所にある
  - 長い名前の省略がない
  - 言語の切り替えのスクリプトがインラインで書いてある
- **セキュリティレビュー**: 途中で API の回数制限（HTTP 429）にかかり、終わっていない。公開前にやり直す。

### 5. 動きの残り

- 段階2で入れた動き（登場演出、あいさつ、ポインター）を、iPhone の Safari と、パソコンの Chrome・Safari・Firefox で本人が触って確かめる。
- 構造の設計書 10 章の AI エージェント（Hello で会話する）は、まだ設計していない。

### 6. 英語の公開

手順は README の「英語を公開する」にある。訳がそろってから進める。

### 7. 今回の範囲外

- `blog.` など、ほかのアプリ
- OGP 画像を Figma にも置くこと（今はリポジトリの PNG だけ）

## 作業するときの注意

- **`vp`**: グローバルの `vp` が古いと設定どおりに動かないことがある。`vp run check` か `pnpm exec vp check` を使う。
- **テスト**: `apps/web/test` はビルド結果（`apps/web/.output/public`）を読むので、先に `pnpm --filter @ut42tech/web build` する。書き出した中身は `pnpm dlx serve apps/web/.output/public` で見られる（`nuxt preview` は静的な書き出しを配れない）。
- **Nuxt の `useRoute()`**: ページの描画が終わるまで更新されない。画面の土台（`app.vue` と、そこから呼ぶもの）では Vue Router の `currentRoute` を読む。ページの中では `useRoute()` でよい（そのページの経路が返る）。
- **pnpm の公開日数の制限**: 公開されて間もない版は入らない。pnpm が `pnpm-workspace.yaml` に例外を書き足すことがあるが、書き足さずに、少し前の版を指定する。
- **開発サーバーと Tailwind**: 新しく作ったファイルの Tailwind のクラスは、開発サーバーを再起動するまで効かないことがある。
- **部品のスコープ付き CSS**: どのレイヤーにも入らないので、Tailwind のユーティリティより強い。スコープ付きで `display` を決めた要素では、`max-lg:hidden` などが効かない。表示の出し分けは部品の CSS に書く。
- **`vite.config.ts`**: ルートの `@vitejs/plugin-vue` は `as unknown as PluginOption[]` でキャストしている。Vite の型が2つ入っていて、TS2321 になるため。
- **LinkedIn**:
  - アイコンは `simple-icons-11`（`simple-icons@11.0.0` の別名）から読む。最新版の Simple Icons から外されたため。
  - URL は末尾のスラッシュ無しにしている（`packages/profile`）。
- **公開リポジトリの扱い**:
  - 旧サイトの素材の `private/` には個人情報と API キーがある。リポジトリに入れない。
  - 設計書などに、参考にしたサイトの名前を書かない。

## 資料の場所

| 資料                 | 場所                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| 設計書               | `docs/superpowers/specs/`                                                 |
| 計画                 | `docs/superpowers/plans/`（最新は `2026-11-18-portfolio-nuxt-phase1.md`） |
| デザイン             | Figma の `ZPaC9SNAfMyKTROfRvAJyT`                                         |
| 使い方・中身の足し方 | `README.md`                                                               |
