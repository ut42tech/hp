import { sortByDateDesc } from "@/lib/utils";
import type { PressItem } from "./types";

/**
 * 自分が取り上げられた Web 記事（手動キュレーション）。
 * 新しい掲載が出たらここに追加する。例:
 *
 * {
 *   title: "長崎市シティプロモーションのインタビューに掲載",
 *   outlet: "長崎のWA!（長崎市）",
 *   url: "https://example.com/article",   // 実URLを設定
 *   date: "2025-11",
 *   type: "interview",
 *   excerpt: "学生エンジニアとしての活動を取材いただきました。",
 *   // thumbnail: "/press/nagasaki-wa.jpg",  // 任意（OG画像 or 媒体ロゴ）
 * },
 */
export const press: PressItem[] = [];

/** 日付降順で全件返す。 */
export function getAllPress(): PressItem[] {
  return sortByDateDesc(press);
}

/** 最新 n 件（ホームのタイル用）。 */
export function getLatestPress(n: number): PressItem[] {
  return getAllPress().slice(0, n);
}
