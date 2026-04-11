import type { Work, WorkCategory } from "./types";

/**
 * Works のダミーデータ。各カテゴリに 2〜3 件ずつ登録。
 * 実データに差し替える際はこのファイルを直接編集する。
 */
export const works: Work[] = [
  // ─── project ─────────────────────────────────────────────
  {
    slug: "bento-dashboard",
    category: "project",
    title: "Bento Dashboard",
    summary: "研究室のメトリクスを Bento UI で一望できるダッシュボード。",
    body: [
      "共同研究プロジェクトで扱う複数のデータソース(Slack, GitHub, 実験ログ)を 1 枚の Bento グリッドに集約し、週次レビューの所要時間を 30 分から 5 分に短縮した。",
      "フロントエンドは Next.js + Tailwind、バックエンドは Cloudflare Workers で軽量に。データ鮮度とプライバシーを両立する小さな取り組み。",
    ],
    date: "2025-11-20",
    tags: ["Next.js", "TypeScript", "Cloudflare Workers", "Dashboard"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ut42tech/bento-dashboard",
        kind: "github",
      },
      {
        label: "Demo",
        href: "https://bento-dashboard.example.com",
        kind: "demo",
      },
    ],
    featured: true,
  },
  {
    slug: "kaidan-memo",
    category: "project",
    title: "階段メモ",
    summary: "1 日の思考を 5 段階でメモする、最小限のジャーナルアプリ。",
    body: [
      "シンプルな日次ジャーナル。1 日を 5 段の階段に見立て、各段に一行だけ文章を残す。継続の摩擦を極限まで減らす設計に振り切った。",
      "個人利用のために作ったが、公開してから予想外に反応があり、少しずつ機能追加している。",
    ],
    date: "2025-07-04",
    tags: ["React Native", "Expo", "SQLite"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ut42tech/kaidan-memo",
        kind: "github",
      },
    ],
  },
  {
    slug: "paperlens",
    category: "project",
    title: "PaperLens",
    summary: "PDF 論文を読みながら用語の定義にフォーカスできるリーダー。",
    date: "2025-03-18",
    tags: ["Next.js", "pdf.js", "LLM"],
    links: [
      {
        label: "Demo",
        href: "https://paperlens.example.com",
        kind: "demo",
      },
    ],
    featured: true,
  },
  // ─── oss ─────────────────────────────────────────────────
  {
    slug: "tw-bento-preset",
    category: "oss",
    title: "tw-bento-preset",
    summary: "Tailwind CSS v4 向けの Bento グリッドプリセット。",
    body: [
      "Bento UI を Tailwind 標準スケールだけで組めるように、@theme のセマンティックトークンとユーティリティをまとめた軽量プリセット。",
      "arbitrary value を書かずに Bento レイアウトを表現することをコンセプトにしている。",
    ],
    date: "2025-10-02",
    tags: ["Tailwind CSS", "OSS", "Design System"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ut42tech/tw-bento-preset",
        kind: "github",
      },
    ],
  },
  {
    slug: "next-og-ja",
    category: "oss",
    title: "next-og-ja",
    summary: "日本語フォントに強い Next.js OG 画像ヘルパー。",
    date: "2025-05-10",
    tags: ["Next.js", "OGP", "next/og"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ut42tech/next-og-ja",
        kind: "github",
      },
    ],
  },
  // ─── research ────────────────────────────────────────────
  {
    slug: "dialog-eval-2025",
    category: "research",
    title: "対話インターフェースの主観評価尺度の再検討",
    summary: "既存の対話 UX 尺度の日本語版を再設計し、被験者実験で検証した。",
    body: [
      "既存の対話 UX 評価尺度(SASSI 等)は英語圏の被験者を前提としている。これを日本語母語話者向けに再翻訳・再構成し、質問項目の因子構造を確認した。",
      "プレリミナリな結果として、3 因子構造が日本語版でも保たれることを確認。詳細は学内発表会で報告。",
    ],
    date: "2025-12-05",
    tags: ["HCI", "UX Research", "心理測定"],
    links: [
      {
        label: "発表スライド",
        href: "https://speakerdeck.com/ut42tech/dialog-eval-2025",
        kind: "slide",
      },
    ],
    featured: true,
  },
  {
    slug: "bento-ux-survey",
    category: "research",
    title: "Bento UI の情報設計に関する予備調査",
    summary: "Bento 型レイアウトの読解順序と視線移動を定性的に調査。",
    date: "2025-06-22",
    tags: ["HCI", "Information Design"],
    links: [
      {
        label: "技術ブログ",
        href: "https://zenn.dev/ut42tech/articles/bento-ux-survey",
        kind: "article",
      },
    ],
  },
  // ─── experience ──────────────────────────────────────────
  {
    slug: "hack-u-2025",
    category: "experience",
    title: "Hack U 2025 出場",
    summary: "学生向けハッカソンで対話型学習アプリを開発し、優秀賞を受賞。",
    date: "2025-09-14",
    tags: ["Hackathon", "Award"],
    links: [
      {
        label: "イベントレポート",
        href: "https://hacku.example.com/2025/report",
        kind: "article",
      },
    ],
  },
  {
    slug: "intern-frontend-2025",
    category: "experience",
    title: "Web 系スタートアップでのフロントエンドインターン",
    summary: "3 ヶ月間、管理画面の再設計と A/B テスト基盤の整備を担当。",
    date: "2025-08-30",
    tags: ["Internship", "Next.js", "A/B Testing"],
    links: [],
  },
  {
    slug: "devfest-tokyo-2025",
    category: "experience",
    title: "DevFest Tokyo 2025 登壇",
    summary: "Next.js 16 の Proxy と Cache Components について話した。",
    date: "2025-11-02",
    tags: ["Talk", "Next.js"],
    links: [
      {
        label: "発表スライド",
        href: "https://speakerdeck.com/ut42tech/devfest-tokyo-2025",
        kind: "slide",
      },
    ],
  },
];

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

export function getFeaturedWorks(): Work[] {
  return works.filter((work) => work.featured === true);
}

export function getWorksByCategory(category: WorkCategory): Work[] {
  return works.filter((work) => work.category === category);
}

/** カテゴリの表示順と日本語ラベル。UI のフィルタチップ等から参照する */
export const workCategories: { value: WorkCategory; label: string }[] = [
  { value: "project", label: "Projects" },
  { value: "oss", label: "OSS" },
  { value: "research", label: "Research" },
  { value: "experience", label: "Experience" },
];
