/**
 * ポートフォリオが扱うコンテンツの型定義。
 * 初期実装は日本語のみのため、文言は全てプレーンな string で書く。
 * 多言語化は後続タスクで next-intl に移行する前提。
 */

export type LinkKind =
  | "github"
  | "demo"
  | "paper"
  | "slide"
  | "article"
  | "other";

/** Projects / Works 共通の外部リンク。 */
export interface ContentLink {
  label: string;
  href: string;
  kind: LinkKind;
}

/** 開発プロジェクト（microCMS の projects API で管理）。 */
export interface Project {
  /** URL に使う識別子。microCMS の contentId */
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM-DD 形式 */
  date: string;
  tags: string[];
  thumbnail?: string;
  links: ContentLink[];
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
  /** 丸アバター用サムネイル URL(任意。なければカテゴリアイコンでフォールバック) */
  thumbnail?: string;
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

/** メディアで取り上げられた Web 記事（microCMS で管理）。 */
export interface PressItem {
  title: string;
  /** 媒体名（例: 長崎のWA!（長崎市）） */
  outlet: string;
  url: string;
  /** YYYY-MM または YYYY-MM-DD */
  date: string;
  thumbnail?: string;
  excerpt?: string;
}

export interface Profile {
  name: string;
  /** 肩書きタグ（Hero でハッシュタグ表示。例: ["学生エンジニア", "フルスタック", "デザイン"]） */
  roleTags: string[];
  /** 所属。Hero サイドバーで「role / at school」の2行に分けて表示する */
  affiliation: { role: string; school: string };
  /** 研究室。Hero でリンク表示する */
  lab: { name: string; url: string };
  /** コミュニティ・役職などの肩書き一覧（Hero に列挙） */
  titles: string[];
  /** Hero で語るモットー（日本語） */
  motto: string;
  /** モットーの英語版（Hero のタイピングで日本語と交互にループ表示） */
  mottoEn: string;
  /** 旧 About 本文。ホームでは未使用（データは保持可） */
  bio?: string[];
  image?: string;
  social: SocialLink[];
  techStack: string[];
  photos: PhotoEntry[];
}
