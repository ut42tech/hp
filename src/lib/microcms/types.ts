/**
 * microCMS API の raw レスポンス型。
 * - 日付フィールドは ISO 8601 UTC 文字列（JST で選んだ日付は前日 15:00Z になる）
 * - セレクトフィールドは単一選択でも string[]
 * - 画像フィールドは { url, width, height }
 * - 繰り返しカスタムフィールドは fieldId 付きオブジェクトの配列
 */

export interface MicroCMSImage {
  url: string;
  width?: number;
  height?: number;
}

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface RawPress {
  id: string;
  title: string;
  outlet: string;
  url: string;
  date: string;
  type: string[];
  thumbnail?: MicroCMSImage;
  excerpt?: string;
}

export interface RawWorkLink {
  fieldId: string;
  label: string;
  href: string;
  kind: string[];
}

export interface RawWork {
  id: string;
  title: string;
  category: string[];
  summary: string;
  body?: string;
  date: string;
  tags?: string;
  thumbnail?: MicroCMSImage;
  links?: RawWorkLink[];
}

export interface RawTimelineEntry {
  id: string;
  title: string;
  date: string;
  category: string[];
  description?: string;
  location?: string;
  thumbnail?: MicroCMSImage;
}
