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
  | "qiita"
  | "zenn"
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

/** Keywords タイルに表示する人物像キーワード。 */
export interface Keyword {
  label: string;
  /** 重要度＝大きさ・中心への寄り。xl(主役) > lg > md > sm */
  size: "xl" | "lg" | "md" | "sm";
  /** true で accent（緑）バッジになる */
  accent?: boolean;
}

/** Press エントリの種別。バッジ表示に使う。 */
export type PressType = "interview" | "feature" | "award" | "event" | "media";

/** 自分が取り上げられた Web 記事（手動キュレーション）。 */
export interface PressItem {
  title: string;
  /** 媒体名（例: 長崎のWA!（長崎市）） */
  outlet: string;
  url: string;
  /** YYYY-MM または YYYY-MM-DD */
  date: string;
  type: PressType;
  thumbnail?: string;
  excerpt?: string;
}

export interface Profile {
  name: string;
  /** 肩書き（例: "学生エンジニア / フルスタック"） */
  role: string;
  /** 所属（例: "M1 Student · Nagasaki University"） */
  affiliation: string;
  /** 研究室。Hero でリンク表示する */
  lab: { name: string; url: string };
  /** Hero で語るモットー */
  motto: string;
  /** 旧 About 本文。ホームでは未使用（データは保持可） */
  bio?: string[];
  image?: string;
  social: SocialLink[];
  techStack: string[];
  timeline: TimelineEntry[];
  photos: PhotoEntry[];
}
