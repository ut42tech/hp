/**
 * microCMS のリネーム移行で残った不要コンテンツを削除するワンショットスクリプト。
 * - projects: 旧 works の experience 8 件（同等の内容が timeline に既存。
 *   うち 5 件相当は新 works に seed-works.mjs でシードする）
 * - works: スキーマ確認用のテストアイテム
 *
 * 使い方:
 *   MICROCMS_SERVICE_DOMAIN=xxxx MICROCMS_WRITE_API_KEY=yyyy \
 *     node scripts/cleanup-microcms.mjs
 */

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_WRITE_API_KEY;
if (!serviceDomain || !apiKey) {
  console.error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_WRITE_API_KEY を設定してください。",
  );
  process.exit(1);
}

const TARGETS = [
  ["projects", "chotech"],
  ["projects", "n-code-labo"],
  ["projects", "zenrin-internship"],
  ["projects", "brightj-internship"],
  ["projects", "iiit-delhi-exchange"],
  ["projects", "tni-summer-school"],
  ["projects", "jset-2024"],
  ["projects", "nagasaki-univ-award"],
  ["works", "o9e0-5d2v"], // スキーマ確認用テストアイテム「tesuto」
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (const [endpoint, id] of TARGETS) {
  const res = await fetch(
    `https://${serviceDomain}.microcms.io/api/v1/${endpoint}/${id}`,
    { method: "DELETE", headers: { "X-MICROCMS-API-KEY": apiKey } },
  );
  if (!res.ok) {
    throw new Error(
      `DELETE ${endpoint}/${id} failed: ${res.status} ${await res.text()}`,
    );
  }
  console.log(`${endpoint}/${id} deleted`);
  await sleep(250); // 書き込み API のレート制限対策
}

console.log(`done: ${TARGETS.length} 件`);
