import type { Work, WorkCategory } from "./types";

export const works: Work[] = [
  // ─── project ─────────────────────────────────────────────
  {
    slug: "coto2-ba",
    category: "project",
    title: "コトコトバ",
    summary:
      "ガバイソン 2026 春 グランプリ＋追加賞受賞作品。チーム「じげもんテック」で開発。",
    body: [
      "ガバイソン 2026 春でグランプリおよび追加賞を受賞した作品。チーム「じげもんテック」（上原拓也 + 西山依吹）として開発した。",
      "長崎の地域課題をテクノロジーで解決するコンセプトで、企画からデザイン・実装まで一貫して担当。",
    ],
    date: "2026-03-15",
    tags: ["Award", "Hackathon", "Team"],
    links: [
      {
        label: "Demo",
        href: "https://coto2-ba.ut42tech.com",
        kind: "demo",
      },
      {
        label: "GitHub",
        href: "https://github.com/nu-chotech/coto2-ba",
        kind: "github",
      },
    ],
    featured: true,
  },
  {
    slug: "muse-port",
    category: "project",
    title: "MUSE PORT",
    summary:
      "クリエイティブサークル向けのポートフォリオ投稿 Web アプリ。開発リーダーとして設計・実装を主導。",
    body: [
      "マルチメディア研究部のメンバーが作品を投稿・閲覧できるポートフォリオプラットフォーム。",
      "Next.js + FastAPI + AWS（Lambda / DynamoDB / S3）のサーバーレス構成で、開発リーダーとして設計からデプロイまでを担当した。",
    ],
    date: "2024-06-01",
    tags: ["Next.js", "FastAPI", "AWS", "Team"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/nu-multimedia-lab/muse_port",
        kind: "github",
      },
    ],
  },
  {
    slug: "emodialog",
    category: "project",
    title: "EmoDialog",
    summary:
      "LLM 搭載の感情分析日記アプリ。日記を AI が分析し、パーソナライズされた応答と感情の可視化を提供。",
    body: [
      "ユーザーの日記を LLM が分析し、パーソナライズされた応答を返す Web アプリケーション。",
      "Flask + OpenAI API + Matplotlib + Bootstrap で構成。感情の推移を Matplotlib でグラフ化する機能を実装した。",
    ],
    date: "2024-02-01",
    tags: ["Flask", "OpenAI API", "Python", "Matplotlib"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ut42univ/EmoDialog-Flask",
        kind: "github",
      },
    ],
  },
  {
    slug: "technova-checkin",
    category: "project",
    title: "テクノバチェックインシステム",
    summary:
      "テクノバながさきの DX 担当として開発した、子ども向けイベントの受付・管理 Web アプリ。",
    body: [
      "テクノバながさきで開催される子ども向けクリエイティブイベントの受付・管理を効率化するシステム。",
      "DX 担当として企画から開発・運用まで一貫して担当。テクノバフェス 2025 では 400 名以上の来場者受付に活用された。",
    ],
    date: "2025-05-01",
    tags: ["Web", "DX"],
    links: [],
  },
  // ─── oss ─────────────────────────────────────────────────
  {
    slug: "tangi",
    category: "oss",
    title: "tangi",
    summary:
      "物理的な「触れるインターフェース」を Web で扱うための tangible UI SDK。研究室での趣味プロジェクトとして開発中。",
    body: [
      "Web 上で tangible（触知可能な）UI を実現するための OSS SDK。",
      "物理デバイスとブラウザの橋渡しを行い、直感的なインタラクションを提供することを目指している。現在開発中。",
    ],
    date: "2026-01-15",
    tags: ["OSS", "TypeScript", "SDK", "Tangible UI"],
    links: [],
  },
  // ─── research ────────────────────────────────────────────
  {
    slug: "llmeta",
    category: "research",
    title: "LLMeta",
    summary:
      "LLM による文脈理解と視覚化機能を備えたメタバースコミュニケーション基盤。卒業研究としてフルスクラッチ開発。",
    body: [
      "AI 搭載メタバースプラットフォームのプロトタイプ。会話文脈の LLM 解析・感情視覚化、音声認識、3D 空間への情報投影、AI エージェントによる要約・質問応答・画像生成などの機能を実装。",
      "TypeScript / Next.js / 独自 3D・WebXR 基盤 / OpenAI API / Deepgram / LiveKit / Three.js で構成。大学生 20 名（10 ペア）の実験で SUS 81.0（優れた使いやすさ）、AI 要約の有用性 M=4.80/5.00 を記録した。",
    ],
    date: "2026-03-01",
    tags: ["Metaverse", "LLM", "Three.js", "WebXR", "TypeScript"],
    links: [],
    featured: true,
  },
  {
    slug: "multilingual-ai",
    category: "research",
    title: "多言語コミュニケーション支援 対話型 AI",
    summary:
      "生成 AI を利用した多言語コミュニケーション支援アプリ。JSET 2024 で学生セッション優秀発表賞を受賞。",
    body: [
      "OpenAI（Whisper / GPT / DALL-E）を活用した LINE Bot ベースの多言語コミュニケーション支援システム。",
      "タイ・バンコクの泰日工業大学（TNI）で 34 名からフィードバックを取得し、実地評価を実施。AWS Lambda + DynamoDB + LINE Messaging API で構成。",
    ],
    date: "2024-03-01",
    tags: ["OpenAI API", "AWS", "LINE Bot", "多言語"],
    links: [],
  },
  {
    slug: "lidar-vision",
    category: "research",
    title: "LiDAR Vision",
    summary:
      "視覚障がい者向けの空間認識支援アプリ。IIIT-Delhi 短期留学中に開発。",
    body: [
      "深度センサと触覚フィードバックにより、視覚を使わずにモバイル端末で空間認識を可能にするアプリケーション。",
      "インド IIIT-Delhi の Winter Program で Richa Gupta 先生の指導のもと開発した。",
    ],
    date: "2025-03-01",
    tags: ["LiDAR", "Accessibility", "Mobile"],
    links: [],
  },
  // ─── experience ──────────────────────────────────────────
  {
    slug: "nagasaki-univ-award",
    category: "experience",
    title: "長崎大学 学長賞 受賞",
    summary: "学術研究活動分野で長崎大学学長賞を受賞。",
    date: "2026-03-23",
    tags: ["Award", "Academic"],
    links: [],
    featured: true,
  },
  {
    slug: "chotech",
    category: "experience",
    title: "学生エンジニアコミュニティ ChoTech 設立",
    summary:
      "長崎の学生エンジニアコミュニティを設立し、代表として LT 会やワークショップを運営。",
    body: [
      "2025 年 4 月に設立。NUTIC（長崎スタジアムシティ 4F）を拠点に、LT 会、ワークショップ、技術知識共有などの活動を展開。",
    ],
    date: "2025-04-01",
    tags: ["Community", "Leadership"],
    links: [],
  },
  {
    slug: "iiit-delhi-exchange",
    category: "experience",
    title: "IIIT-Delhi 短期留学",
    summary:
      "インド IIIT-Delhi で約 1 ヶ月間の Winter Program に参加。LiDAR Vision を開発。",
    date: "2025-02-21",
    tags: ["Study Abroad", "India"],
    links: [],
  },
  {
    slug: "n-code-labo",
    category: "experience",
    title: "N Code Labo プログラミング講師",
    summary:
      "角川ドワンゴ学園でオンライン家庭教師として Unity / Python / Swift 等のプログラミング指導。",
    date: "2024-05-01",
    tags: ["Teaching", "Programming"],
    links: [],
  },
  {
    slug: "jset-2024",
    category: "experience",
    title: "JSET 2024 学生セッション優秀発表賞",
    summary:
      "日本教育工学会 2024 年春季全国大会で学生セッション優秀発表賞を受賞。学部 2 年で最年少。",
    date: "2024-03-20",
    tags: ["Award", "Academic"],
    links: [],
  },
  {
    slug: "tni-summer-school",
    category: "experience",
    title: "タイ TNI Summer School Intern",
    summary:
      "タイ・バンコクの泰日工業大学で 12 日間の PBL プログラムに参加。多言語 AI の実地テストを実施。",
    date: "2023-09-01",
    tags: ["Study Abroad", "Thailand"],
    links: [],
  },
  {
    slug: "brightj-internship",
    category: "experience",
    title: "BrightJ Inc. インターン",
    summary:
      "東京の IT 企業で Upstream Engineer & UI/UX Designer として約 10 ヶ月間のリモートインターン。",
    body: [
      "Adobe XD を用いたワイヤーフレーム・プロトタイプ・UI デザイン、要件分析、技術ドキュメント作成を担当。",
    ],
    date: "2023-05-01",
    tags: ["Internship", "UI/UX Design"],
    links: [],
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
