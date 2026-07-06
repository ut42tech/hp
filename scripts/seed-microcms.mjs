/**
 * 既存ローカルデータを microCMS に投入するワンショットスクリプト。
 *
 * 使い方:
 *   MICROCMS_SERVICE_DOMAIN=xxxx MICROCMS_WRITE_API_KEY=yyyy node scripts/seed-microcms.mjs
 *
 * - works は slug を contentId にするため PUT、timeline は POST で投入する
 * - 画像（thumbnail）は content API から投入できないため、管理画面から手動で設定する
 * - press は現在 0 件のため対象外
 */

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_WRITE_API_KEY;
if (!serviceDomain || !apiKey) {
  console.error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_WRITE_API_KEY を設定してください。",
  );
  process.exit(1);
}

// ─── src/content/works.ts の works 配列を転記（18 件） ───
const WORKS = [
  // ─── project ─────────────────────────────────────────────
  {
    slug: "coto2-ba",
    category: "project",
    title: "コトコトバ",
    summary:
      "ガバイソン2026春 最優秀賞&特別賞受賞作品。チーム「じげもんテック」で開発。",
    body: [
      "佐賀のハッカソン「ガバイソン2026春」にて最優秀賞と特別賞のダブル受賞を果たした作品。2人チーム「じげもんテック」（上原拓也 + 西山依吹）として開発。",
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
    slug: "mapchat",
    category: "project",
    title: "MapChat",
    summary: "技育CAMP ハッカソン Vol.20 出場作品。",
    date: "2024-01-01",
    tags: ["Hackathon"],
    links: [],
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
      "テクノバながさきのシステム&デザイン担当として開発した、子ども向けイベントの受付・管理 Web アプリ。",
    body: [
      "テクノバながさきで開催される子ども向けクリエイティブイベントの受付・管理を効率化するシステム。",
      "システム&デザイン担当として企画から開発・運用・ポスター制作まで一貫して担当。テクノバフェス 2025 では 400 名以上の来場者受付に活用された。",
    ],
    date: "2025-05-01",
    tags: ["Web", "DX"],
    links: [],
  },
  {
    slug: "zenrin-ocr",
    category: "project",
    title: "道路標識 OCR モデル比較",
    summary:
      "ゼンリン R&D 部門インターンにて、道路標識検出用 OSS OCR モデルの性能比較を実施。3 人チームリーダー。",
    body: [
      "EasyOCR と PaddleOCR を中心に、道路標識画像に対する OSS OCR モデルの認識精度を比較評価した。",
      "1 週間のハッカソン形式インターンで、3 人チームのリーダーとして方針策定・実装・発表までを担当。",
    ],
    date: "2024-08-01",
    tags: ["Python", "EasyOCR", "PaddleOCR", "Internship"],
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
  },
  {
    slug: "chotech",
    category: "experience",
    title: "学生エンジニアコミュニティ ChoTech 設立",
    summary:
      "長崎の学生エンジニアコミュニティを設立し、代表として LT 会やワークショップを運営。",
    body: [
      "2025 年 4 月に設立。NUTIC（長崎スタジアムシティ）を拠点に、LT 会、ワークショップ、技術知識共有などの活動を展開。",
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
    slug: "zenrin-internship",
    category: "experience",
    title: "ゼンリン R&D 部門 インターン",
    summary:
      "1 週間のハッカソン形式インターン。道路標識検出用 OSS OCR モデルの性能比較を行い、3 人チームのリーダーを務めた。",
    date: "2024-08-01",
    tags: ["Internship", "Python", "OCR"],
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
    title: "BrightJ Inc.（旧: ユニコネクト）インターン",
    summary:
      "スカウトにより飲食店から転職。上流工程エンジニア & UI/UX Designer として約 10 ヶ月間のリモートインターン。",
    body: [
      "Adobe XD を用いたワイヤーフレーム・プロトタイプ・UI デザイン、要件分析・企画、保守運用を担当。",
    ],
    date: "2023-05-01",
    tags: ["Internship", "UI/UX Design"],
    links: [],
  },
];

// ─── src/content/profile.ts の timeline 配列を転記（30 件） ───
const TIMELINE = [
  {
    date: "2026-05-24",
    category: "event",
    title: "Engineer Guild Hackathon 2026 参加",
    description:
      "東京・メルカリ本社で開催された3日間のハッカソンに参加しました。音楽のすれ違い通信アプリ「Melo Link」を制作しました。",
    location: "東京（メルカリ本社）",
  },
  {
    date: "2026-05-08",
    category: "education",
    title: "Unity Sprint 2026 企画・運営",
    description:
      "Unity & Git講座として、研究室のメンバーやUnityを使ったゲーム制作に興味がある学生を対象とした勉強会を企画・運営しました。",
    location: "長崎大学",
  },
  {
    date: "2026-04",
    category: "education",
    title: "長崎大学大学院 総合生産科学研究科に進学",
    description:
      "瀬戸崎研究室に継続所属し、さらに高度な研究に取り組む予定です。",
  },
  {
    date: "2026-03",
    category: "event",
    title: "長崎大学 学長賞（学術研究活動分野）受賞",
  },
  {
    date: "2026-03",
    category: "event",
    title: "ガバイソン2026春 最優秀賞&特別賞 受賞",
    description:
      "佐賀のハッカソンにて2人チーム「じげもんテック」として「コトコトバ」を開発し、最優秀賞と特別賞のダブル受賞を果たしました。",
  },
  {
    date: "2026-03",
    category: "education",
    title: "長崎大学 情報データ科学部 卒業",
  },
  {
    date: "2025-11",
    category: "event",
    title: "「長崎のWA!」インタビュー掲載",
    description:
      "長崎市シティプロモーションのインタビュー記事に掲載されました。",
  },
  {
    date: "2025-10",
    category: "event",
    title: "長崎ハッカソン2025 イベント企画・ジャパネット賞受賞",
    description:
      "学生団体で企業と協力しての、長崎スタジアムシティでは初のハッカソン企画の試みでした。ジャパネット様とカラビナテクノロジー株式会社様のご協力により、ハッカソンの開催が実現しました。",
  },
  {
    date: "2025-08",
    category: "education",
    title: "高校生アプリ開発講座 メンター",
    description:
      "長崎県内の高校生を対象としたアプリ開発講座のメンターを務めました。Unityを用いたゲーム開発を指導し、加えて講義動画の制作も担当しました。",
    location: "長崎",
  },
  {
    date: "2025-04",
    category: "event",
    title: "学生エンジニアコミュニティChoTechを設立",
    description:
      "長崎の学生エンジニアコミュニティを立ち上げ、代表を務めています。2026年度から長崎大学の公認団体に認定されました。主にNUTIC（長崎スタジアムシティ）を拠点に活動しています。",
    location: "長崎",
  },
  {
    date: "2025-04",
    category: "education",
    title: "瀬戸崎研究室に配属",
    description:
      "学部2年次から関わっていたものの、正式に研究室に配属されました。",
  },
  {
    date: "2025-02",
    category: "education",
    title: "インド情報技術大学へ短期留学",
    description:
      "IIIT-D（Indian Institutes of Information Technology, Delhi）へ短期留学しました。Richa Gupta先生の指導のもと、深度センサと触覚フィードバックを活用した視覚障がい者向け空間認識支援アプリ（LiDAR Vision）を開発しました。",
    location: "インド・ニューデリー",
  },
  {
    date: "2025-01",
    category: "event",
    title: "技育CAMP ハッカソン Vol.20 出場",
    description: "「MapChat」を開発しました。",
  },
  {
    date: "2024-08",
    category: "work",
    title: "ゼンリン R&D部門 インターン",
    description:
      "道路標識検出用OSSのOCRモデルの性能比較を行い、3人チームのリーダーを務めました。",
  },
  {
    date: "2024-07",
    category: "work",
    title: "長崎大学ジュニアドクター育成塾 メンター",
    description:
      "中学生のアプリ開発支援に携わり始めました。主にUnityを用いたゲーム開発を指導しています。",
  },
  {
    date: "2024-06",
    category: "work",
    title: "テクノバながさき 学生メンター",
    description:
      "子ども向けクリエイティブ活動支援を行う大学生メンターを務めました。特にシステム&デザイン担当として、チェックインシステムの開発やポスター等の制作も担いました。",
    location: "長崎",
  },
  {
    date: "2024-05",
    category: "work",
    title: "N Code Labo プログラミング講師",
    description:
      "角川ドワンゴ学園でオンライン家庭教師として Unity / Python / Swift 等を指導しています。",
  },
  {
    date: "2024-03",
    category: "event",
    title: "日本教育工学会（JSET）2024年春季全国大会 学生セッション優秀発表賞",
    description:
      "多言語コミュニケーション支援AIの研究で、学部2年次に論文を執筆しました。口頭発表を行い、最年少で優秀賞を受賞しました。",
    location: "熊本大学",
  },
  {
    date: "2023-09",
    category: "education",
    title: "タイへ短期留学",
    description:
      "タイ・バンコクの泰日工業大学（Thai-Nichi Institute of Technology）へ短期留学しました。AIを活用した多言語コミュニケーション支援システムの実証実験を行い、現地の学生や教員と交流しました。",
    location: "タイ・バンコク",
  },
  {
    date: "2023-05",
    category: "work",
    title: "BrightJ Inc.（旧:ユニコネクト株式会社） 長期インターン",
    description:
      "スカウトにより飲食店から転職しました。上流工程エンジニア & UI/UX Designer として、デザインと企画・保守運用を担当しました。",
    location: "東京（リモート）",
  },
  {
    date: "2022-05",
    category: "work",
    title: "飲食店のアルバイトを始める",
    description: "浜勝（とんかつ屋）でホールスタッフとして勤務しました。",
    location: "長崎",
  },
  {
    date: "2022-04",
    category: "education",
    title: "長崎大学 情報データ科学部 入学",
  },
  {
    date: "2022-03",
    category: "education",
    title: "高校卒業",
    description:
      "生徒会執行部、弓道部・茶道部・写真部に所属しました。弓道初段、表千家入門のお免状を取得しました。",
  },
  {
    date: "2019-04",
    category: "education",
    title: "高校入学",
    description:
      "長崎県立長崎北陽台高校普通科に入学しました。大学進学のため、好きだった制作活動は我慢し、学業に向き合うことにしました。",
  },
  {
    date: "2016-04",
    category: "life",
    title: "3DCGや映像制作に没頭",
    description:
      "MinecraftのCGアニメーションやモーショングラフィックスを制作しました。YouTubeなどで公開したり、制作物が有名なYouTuberに使用されたりするなど、早くからクリエイティブな活動を行っていました。",
  },
  {
    date: "2015-04",
    category: "life",
    title: "自作PCとソフトウェア開発に興味を持つ",
    description:
      "MinecraftのMOD（改造プログラム）やサーバープラグインの開発に挑戦しました。家のPCを改造し始めるなど、ハードウェアへの関心も深まりました。",
  },
  {
    date: "2014-04",
    category: "life",
    title: "プログラミングとの出会い",
    description:
      "小学4年生の頃、Minecraft PE サーバーを運営するために PHP を独学しました。自宅のポートを開放してサーバーを公開するなど、ネットワーク知識も自力で習得しました。",
  },
  {
    date: "2012-04",
    category: "life",
    title: "長崎へUターン",
  },
  {
    date: "2010-04",
    category: "life",
    title: "小学校入学時に横浜へ引っ越す",
  },
  {
    date: "2003-04",
    category: "life",
    title: "長崎県に生まれる",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** "YYYY-MM" / "YYYY-MM-DD" → microCMS 日付フィールド用 ISO（UTC 0時 = JST 9時で日付が保たれる）。 */
const toIsoDate = (date) => {
  const [y, m, d] = date.split("-");
  return `${y}-${m}-${d ?? "01"}T00:00:00.000Z`;
};

async function send(method, path, body) {
  const res = await fetch(
    `https://${serviceDomain}.microcms.io/api/v1/${path}`,
    {
      method,
      headers: {
        "X-MICROCMS-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(
      `${method} ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
}

for (const w of WORKS) {
  await send("PUT", `works/${w.slug}`, {
    title: w.title,
    category: [w.category],
    summary: w.summary,
    ...(w.body ? { body: w.body.join("\n\n") } : {}),
    date: toIsoDate(w.date),
    ...(w.tags.length > 0 ? { tags: w.tags.join(", ") } : {}),
    ...(w.links.length > 0
      ? {
          links: w.links.map((l) => ({
            fieldId: "link",
            label: l.label,
            href: l.href,
            kind: [l.kind],
          })),
        }
      : {}),
  });
  console.log(`works/${w.slug} OK`);
  await sleep(250); // 書き込み API のレート制限対策
}

for (const t of TIMELINE) {
  await send("POST", "timeline", {
    title: t.title,
    date: toIsoDate(t.date),
    category: [t.category],
    ...(t.description ? { description: t.description } : {}),
    ...(t.location ? { location: t.location } : {}),
  });
  console.log(`timeline: ${t.title} OK`);
  await sleep(250);
}

console.log(`done: works=${WORKS.length}, timeline=${TIMELINE.length}`);
