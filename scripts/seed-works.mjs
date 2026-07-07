/**
 * 新 works API（開発以外の取り組み）へ初期データ 5 件を投入するワンショットスクリプト。
 *
 * 使い方:
 *   MICROCMS_SERVICE_DOMAIN=xxxx MICROCMS_WRITE_API_KEY=yyyy node scripts/seed-works.mjs
 *
 * - slug を contentId にするため PUT を使う
 * - 画像（thumbnail）と url は content API から投入せず、管理画面から手動で設定する
 */

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_WRITE_API_KEY;
if (!serviceDomain || !apiKey) {
  console.error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_WRITE_API_KEY を設定してください。",
  );
  process.exit(1);
}

const WORKS = [
  {
    slug: "chotech",
    title: "学生エンジニアコミュニティ ChoTech 設立・運営",
    summary:
      "長崎の学生エンジニアコミュニティを設立し、代表として LT 会やワークショップを運営。2026 年度から長崎大学の公認団体。",
    date: "2025-04-01",
  },
  {
    slug: "nagasaki-hackathon-2025",
    title: "長崎ハッカソン2025 企画・運営",
    summary:
      "長崎スタジアムシティでは初のハッカソンを学生団体として企画・運営。ジャパネット賞を受賞。",
    date: "2025-10-01",
  },
  {
    slug: "junior-doctor-mentor",
    title: "長崎大学ジュニアドクター育成塾 メンター",
    summary:
      "中学生のアプリ開発支援に従事。主に Unity を用いたゲーム開発を指導。",
    date: "2024-07-01",
  },
  {
    slug: "technova-mentor",
    title: "テクノバながさき 学生メンター",
    summary:
      "子ども向けクリエイティブ活動支援を行う学生メンター。システム&デザイン担当としてチェックインシステム開発やポスター制作も担当。",
    date: "2024-06-01",
  },
  {
    slug: "n-code-labo",
    title: "N Code Labo プログラミング講師",
    summary:
      "角川ドワンゴ学園でオンライン家庭教師として Unity / Python / Swift 等のプログラミング指導。",
    date: "2024-05-01",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** "YYYY-MM-DD" → microCMS 日付フィールド用 ISO（UTC 0時 = JST 9時で日付が保たれる）。 */
const toIsoDate = (date) => `${date}T00:00:00.000Z`;

for (const w of WORKS) {
  const res = await fetch(
    `https://${serviceDomain}.microcms.io/api/v1/works/${w.slug}`,
    {
      method: "PUT",
      headers: {
        "X-MICROCMS-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: w.title,
        summary: w.summary,
        date: toIsoDate(w.date),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(
      `PUT works/${w.slug} failed: ${res.status} ${await res.text()}`,
    );
  }
  console.log(`works/${w.slug} OK`);
  await sleep(250); // 書き込み API のレート制限対策
}

console.log(`done: ${WORKS.length} 件`);
