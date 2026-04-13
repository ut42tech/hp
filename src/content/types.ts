/**
 * ポートフォリオが扱うコンテンツの型定義。
 * 初期実装は日本語のみのため、文言は全てプレーンな string で書く。
 * 多言語化は後続タスクで next-intl に移行する前提。
 */

export type WorkCategory = "project" | "oss" | "research" | "experience";

export type LinkKind =
  | "github"
  | "demo"
  | "paper"
  | "slide"
  | "article"
  | "other";

export interface WorkLink {
  label: string;
  href: string;
  kind: LinkKind;
}

export interface Work {
  /** URL に使う識別子。言語不問(単一言語でも命名規約は統一) */
  slug: string;
  category: WorkCategory;
  title: string;
  summary: string;
  /** プレーンテキスト段落の配列。Markdown パーサは使わない */
  body?: string[];
  /** YYYY-MM-DD 形式 */
  date: string;
  tags: string[];
  thumbnail?: string;
  links: WorkLink[];
  /** true の場合、Bento ホームの Featured タイルに表示される */
  featured?: boolean;
}

export type SocialIcon =
  | "github"
  | "x"
  | "youtube"
  | "wantedly"
  | "note"
  | "other";

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

/**
 * 自己紹介タイムラインのカテゴリ。アイコンと色分けに用いる。
 * - life: 誕生、人生の節目
 * - education: 入学・卒業などの学歴
 * - work: アルバイト・インターン・就業
 * - event: 登壇、受賞、ハッカソン等のイベント
 * - other: それ以外
 */
export type TimelineCategory =
  | "life"
  | "education"
  | "work"
  | "event"
  | "other";

export interface TimelineEntry {
  /** YYYY-MM または YYYY-MM-DD 形式 */
  date: string;
  category: TimelineCategory;
  title: string;
  description?: string;
  /** 所属先や場所(任意) */
  location?: string;
}

export interface PhotoEntry {
  /** public/ からの相対パス */
  src: string;
  /** アクセシビリティ用の代替テキスト */
  alt: string;
  /** クリック時にオーバーレイで表示するキャプション(任意) */
  caption?: string;
  /** 撮影日や日付。YYYY-MM-DD 形式(任意) */
  date?: string;
}

export interface Profile {
  name: string;
  /** 役職や肩書き(例: "情報系大学院生 / フロントエンド エンジニア") */
  role: string;
  /** 所属(例: "〇〇大学院 情報理工学系研究科") */
  affiliation: string;
  /** Bento About タイルで表示する自己紹介本文。配列の場合は段落ごとに分割表示 */
  bio: string | string[];
  /** プロフィール画像のパス(public/ からの相対パス) */
  image?: string;
  social: SocialLink[];
  /** Tech Stack タイルに表示する技術名。アイコンは使わず名前のみ */
  techStack: string[];
  /** About ページのタイムラインに表示する経歴・出来事 */
  timeline: TimelineEntry[];
  /** ホームの Photos タイルに表示する写真 */
  photos: PhotoEntry[];
}
