# 文面更新チェックリスト

モバイルファースト・リニューアルでは、デザインと構成を先に刷新し、**文面（肩書き・自己紹介・Timeline・Projects の中身）は既存データからの転記・抜粋の暫定値**のままにしている（[設計書](./superpowers/specs/2026-11-03-mobile-first-renewal-design.md) §1 非ゴール）。本書は、文面を最新化するときに何を確認すればよいかの一覧。ここでは確認項目だけを挙げ、文面そのものはここでは決めない。

更新後は `pnpm lint && pnpm test && pnpm build` を通し、`node scripts/check-layout.mjs <baseUrl> <outDir>` で 375px のファーストビューと横スクロールを確認する（手順は [README](../README.md) を参照）。

## 1. 肩書き・自己紹介

対象ファイル: `src/content/profile.ts`（型は `src/content/types.ts` の `Profile`）

- [ ] **`headline`** — 現在値: 「学生エンジニア / フルスタック・デザイン」。Intro の肩書き 1 行と OGP 画像に使われる。今の立場・得意領域を表せているか。1 行で折り返さず読める長さか
- [ ] **`affiliation`**（`role` / `school`） — 現在値: Master's Student / Nagasaki University。Intro には `{role} · {school}` と研究室リンクが「Master's Student · Nagasaki University」「Setozaki Lab」の形で表示される。進級・所属変更後も正しいか、role の表記を変更するか（例: M1）
- [ ] **`lab`**（`name` / `url`） — 現在値: Setozaki Lab。研究室名・リンク先が現在も有効か
- [ ] **`motto`** — 現在値: 「デザインとテクノロジーで、最高のユーザ体験を届けたい。」。Intro の 1 行。変更する場合は `summary` の 1 文目や metadata の description にも同じ文言が出るので揃える
- [ ] **`summary`** — About 冒頭の 2〜3 文（現在 3 文）。直近の研究テーマ・活動（ChoTech など）が最新か。事実関係（受賞・設立時期）に誤りがないか
- [ ] **`bio`** — 「続きを読む」で展開される長文（現在 4 段落）。`summary` と内容が重複・矛盾していないか。古くなった記述（在学区分・研究内容）がないか
- [ ] **`titles`** — About の役職・活動の箇条書き（現在 5 件）。終了した役職の削除、新しい役職の追加、表記（正式名称）の確認
- [ ] **`social`** — 各リンクの生存確認と、`primary: true`（Intro に出す主要 SNS、現在 X / GitHub / Zenn / Wantedly の 4 個）の選び直し。Footer は全件表示
- [ ] **`techStack`** — Skills のカテゴリ別チップ（Languages / Web / Infra / Creative / Academic）。実際に使っていないものの削除、新しく使うようになったものの追加
- [ ] **`image`**（`/profile.jpg`） — 現在の写真か。`photos`（About の写真帯）の入れ替えも合わせて検討

## 2. Timeline

対象ファイル: `src/content/profile.ts` の `timeline`（型は `TimelineEntry`）

- [ ] **2026-05 以降の追加** — 現在の最新は 2026-05-24「Engineer Guild Hackathon 2026 参加」。それ以降の活動・受賞・登壇・就職先などを追加（`date` は `YYYY-MM` または `YYYY-MM-DD`）
- [ ] **`featured`**（折りたたみ時にも表示される主要項目。現在 6 件: 大学院進学 / 学長賞 / ガバイソン最優秀賞 / ChoTech 設立 / インド留学 / 2024-03 の項目） — 今の自分を伝える項目になっているか。多すぎず 6 件前後か。古い項目を外し、新しい項目を加える
- [ ] **`highlight`**（Highlights に出る項目。現在 Timeline 側は「長崎大学 学長賞（学術研究活動分野）受賞」と「JSET 2024年春季全国大会 学生セッション優秀発表賞」の 2 件で、Work 側の「コトコトバ」と合わせて上限の 3 件に達している） — Highlights は Work と Timeline を合わせて日付降順で最大 3 件のため、新しい項目を足す場合は何かを外す必要がある。直近の目玉が選ばれているか。Highlights には Work の `summary` / Timeline の `description` が 2 行に切り詰めて表示される
- [ ] **各項目の `title` / `description` / `location`** — 事実関係・表記、`description` の長さ（長すぎないか）
- [ ] **`life` カテゴリ** — 全件表示時のみ出る。公開してよい内容か

## 3. Projects

対象ファイル: `src/content/works.ts`（型は `Work`）。Projects セクションには `category` が `project` / `oss` / `research` のものが日付降順で全件出る（`experience` は出ない）。

- [ ] **追加作品** — 直近のハッカソン作品・個人開発・OSS・研究などの追記（手順は `.claude/skills/add-work/SKILL.md`）
- [ ] **各 `links` の生存確認** — GitHub / Demo / 論文 / スライドなどのリンク切れ、非公開化したリポジトリがないか
- [ ] **`summary`** — Projects の 1 行説明（全文が表示される）。1 行で何の作品か伝わるか。古い・曖昧な説明の見直し
- [ ] **`tags`** — 表記ゆれ（Next.js / NextJS など）がないか
- [ ] **`highlight`**（Highlights に出る作品。現在 Work 側は「コトコトバ」） — 最新の代表作・受賞作になっているか。Timeline 側の `highlight` と合わせて 3 件以内に収まるか
- [ ] **MapChat（`slug: "mapchat"`）の空リンク** — `links: []` のためリンクが出ない。公開できるリポジトリ・デモがあれば追加し、なければこのままでよいか判断する

## 4. 公開前・その他

- [ ] **工事中バナー** — `src/lib/site.ts` の `underConstruction: true` により、ページ上部に工事中バナーが出る。公開時にバナーを外す（`false` にする）かを決める
- [ ] **Press（掲載記事）を初めて追加するとき** — `src/content/press.ts` の `press` に 1 件目を追加したら、`/press` ページの `PressCard` がまだ旧来のカード表示のまま。新トーン（カードを原則使わない）への調整が必要
- [ ] **Press 追加時の自動表示の確認** — 1 件以上になると、Writing セクション内に Press 一覧（最新 3 件）と `/press` へのリンクが出て、サイトマップに `/press` が載り、`/press` が 404 でなくなる（0 件の間は自動で非表示）。現在のヘッダーのナビ（`src/lib/navigation.ts`）には Press へのリンクはなく、`Blog` のみ。ナビに Press を載せたい場合は別途対応が必要
- [ ] **metadata の description** — `src/app/page.tsx` と `src/lib/site.ts` の `description` が `headline` や `motto` の変更と食い違っていないか
