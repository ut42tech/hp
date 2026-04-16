import type { Profile } from "./types";

export const profile: Profile = {
  name: "Takuya Uehara",
  role: "Creative Engineer",
  affiliation: "長崎大学 大学院 総合生産科学研究科 修士課程 / Setozaki Lab.",
  bio: [
    "「デザインとテクノロジーで最高のユーザ体験を届けたい」がモットー。幼少期から好奇心旺盛な性格で、絵画や工作に没頭。小学生の頃にはPHPを独学しサーバーを自宅で運営。中学生の頃には自作PCやソフトウェア開発に興味を持ったり、3DCGアニメーションやモーショングラフィックスの映像制作など、つくることへの情熱は早くから芽生えていました。",
    "高校では弓道・茶道・写真を通じて日本文化の様式美に触れ、その感覚はいまもデザインの根底にあります。",
    "大学は長崎大学 情報データ科学部に進学し、コンピュータサイエンスとデータサイエンスを学ぶ。学部2年次に日本教育工学会2024年春季全国大会の口頭発表にて、最年少で学生優秀賞を受賞。卒業研究では生成AIを用いたコミュニケーション支援メタバースプラットフォームをWeb技術をメインにフルスクラッチで開発。",
    "タイやインドなどへの海外渡航経験や留学生との交流を通じて、言語や文化を超えたコミュニケーションの可能性にも強い関心を持っています。長崎のテックカルチャーを盛り上げたいという想いから、学生エンジニアコミュニティChoTechを創設し、地域の技術コミュニティの活性化にも取り組んでいます。",
  ],
  image: "/profile.jpg",
  social: [
    {
      label: "X",
      href: "https://x.com/ut42tech",
      icon: "x",
    },
    {
      label: "GitHub",
      href: "https://github.com/ut42tech",
      icon: "github",
    },
    {
      label: "note",
      href: "https://note.com/ut42tech",
      icon: "note",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@ut42tech",
      icon: "youtube",
    },
    {
      label: "Wantedly",
      href: "https://www.wantedly.com/id/tuehara",
      icon: "wantedly",
    },
  ],
  techStack: [
    // Languages
    "TypeScript",
    "Python",
    "C#",
    "Swift",
    "Java",
    // Web Frameworks
    "React",
    "Next.js",
    "FastAPI",
    "Flask",
    "Tailwind CSS",
    "Three.js",
    // Infra / Cloud
    "AWS",
    "GCP",
    "Vercel",
    "Supabase",
    "Heroku",
    "Cloudflare",
    "Docker",
    "Proxmox",
    "Linux",
    "Git",
    // Creative
    "Unity",
    "Blender",
    "Cinema 4D",
    "After Effects",
    "Premiere Pro",
    "Photoshop",
    "Adobe XD",
    "Final Cut Pro",
    "Figma",
    // Academic
    "LaTeX",
    "Typst",
  ],
  timeline: [
    {
      date: "2026-04",
      category: "education",
      title: "長崎大学大学院 総合生産科学研究科に進学",
      description: "瀬戸崎研究室に継続所属し、さらに高度な研究に取り組む予定。",
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
        "佐賀のハッカソンにて2人チーム「じげもんテック」として「コトコトバ」を開発し、最優秀賞と特別賞のダブル受賞を果たす。",
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
      description: "長崎市シティプロモーションのインタビュー記事に掲載。",
    },
    {
      date: "2025-10",
      category: "event",
      title: "長崎ハッカソン2025 開催・ジャパネット賞受賞",
      description:
        "学生団体で企業と協力しての長崎スタジアムシティでの初のハッカソン企画の試み。ジャパネット様とカラビナテクノロジー株式会社様とのご協力により、ハッカソン開催が実現した。",
    },
    {
      date: "2025-08",
      category: "education",
      title: "高校生アプリ開発講座 メンター",
      description:
        "長崎県内の高校生を対象としたアプリ開発講座のメンターを務める。Unityを用いたゲーム開発を指導。加えて、講義動画の制作も担当。",
      location: "長崎",
    },
    {
      date: "2025-04",
      category: "event",
      title: "学生エンジニアコミュニティChoTechを設立",
      description:
        "長崎の学生エンジニアコミュニティを立ち上げ、代表を務める。2026年度から長崎大学の公認団体に認定。主にNUTIC（長崎スタジアムシティ）を拠点に活動。",
      location: "長崎",
    },
    {
      date: "2025-04",
      category: "education",
      title: "瀬戸崎研究室に配属",
      description:
        "学部2年次から関わっていたものの、正式に研究室に配属される。",
    },
    {
      date: "2025-02",
      category: "education",
      title: "インド情報技術大学へ短期留学",
      description:
        "IIIT-D（Indian Institutes of Information Technology, Delhi）へ短期留学。Richa Gupta先生の指導のもと、深度センサと触覚フィードバックを活用した視覚障がい者向け空間認識支援アプリ（LiDAR Vision）を開発。",
      location: "インド・ニューデリー",
    },
    {
      date: "2025-01",
      category: "event",
      title: "技育CAMP ハッカソン Vol.20 出場",
      description: "「MapChat」を開発。",
    },
    {
      date: "2024-08",
      category: "work",
      title: "ゼンリン R&D部門 インターン",
      description:
        "道路標識検出用OSSのOCRモデルの性能比較を行い、3人チームのリーダーを務めた。",
    },
    {
      date: "2024-07",
      category: "work",
      title: "長崎大学ジュニアドクター育成塾 メンター",
      description:
        "中学生のアプリ開発支援に携わり始める。主にUnityを用いたゲーム開発を指導。",
    },
    {
      date: "2024-06",
      category: "work",
      title: "テクノバながさき 学生メンター",
      description:
        "子ども向けクリエイティブ活動支援を行う大学生メンター。特にシステム&デザイン担当としてチェックインシステムを開発とポスター等の制作も担う。",
      location: "長崎",
    },
    {
      date: "2024-05",
      category: "work",
      title: "N Code Labo プログラミング講師",
      description:
        "角川ドワンゴ学園でオンライン家庭教師として Unity / Python / Swift 等を指導。",
    },
    {
      date: "2024-03",
      category: "event",
      title:
        "日本教育工学会（JSET）2024年春季全国大会 学生セッション優秀発表賞",
      description:
        "多言語コミュニケーション支援AIの研究で、学部2年次に論文を執筆。口頭発表を行い、最年少で優秀賞を受賞。",
      location: "熊本大学",
    },
    {
      date: "2023-09",
      category: "education",
      title: "タイへ短期留学",
      description:
        "タイ・バンコクの泰日工業大学（Thai-Nichi Institute of Technology）へ短期留学。AIを活用した多言語コミュニケーション支援システムの実証実験を行い、現地の学生や教員と交流。",
      location: "タイ・バンコク",
    },
    {
      date: "2023-05",
      category: "work",
      title: "BrightJ Inc.（旧:ユニコネクト株式会社） 長期インターン",
      description:
        "スカウトにより飲食店から転職。上流工程エンジニア & UI/UX Designer としてデザインと企画・保守運用を担当した。",
      location: "東京（リモート）",
    },
    {
      date: "2022-05",
      category: "work",
      title: "飲食店のアルバイトを始める",
      description: "浜勝（とんかつ屋）でホールスタッフとして勤務",
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
        "生徒会執行部、弓道部・茶道部・写真部に所属。弓道初段、表千家入門のお免状を取得。",
    },
    {
      date: "2019-04",
      category: "education",
      title: "高校入学",
      description:
        "長崎県立長崎北陽台高校普通科に入学。大学進学のため、好きだった制作活動は我慢し、学業に向き合うことに。",
    },
    {
      date: "2016-04",
      category: "life",
      title: "3DCGや映像制作に没頭",
      description:
        "MinecraftのCGアニメーションやモーショングラフィックスを制作。YouTubeなどで公開したり、制作物は有名なYouTuberに使用されたりするなど、早くからクリエイティブな活動を行う。",
    },
    {
      date: "2015-04",
      category: "life",
      title: "自作PCとソフトウェア開発に興味を持つ",
      description:
        "MinecraftのMOD（改造プログラム）やサーバープラグインの開発に挑戦。家のPCを改造し始めるなど、ハードウェアへの関心も深まる。",
    },
    {
      date: "2014-04",
      category: "life",
      title: "プログラミングとの出会い",
      description:
        "小学4年生の頃、Minecraft PE サーバーを運営するために PHP を独学。自宅のポートを開放してサーバーを公開するなど、ネットワーク知識も自力で習得。",
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
  ],
  photos: [
    {
      src: "/photos/home/1.jpg",
      alt: "タージ・マハル",
      caption: "インド留学中に訪れたタージ・マハル",
      date: "2025-02",
    },
    {
      src: "/photos/home/2.jpg",
      alt: "富士山山頂からのご来光",
      caption: "富士山山頂から眺めたご来光",
    },
    {
      src: "/photos/home/3.jpg",
      alt: "アユタヤ ワット・マハタートにて",
      caption: "タイ留学中に訪れたアユタヤの仏頭",
      date: "2023-09",
    },
  ],
};
