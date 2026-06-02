import type { Keyword } from "./types";

/**
 * Keywords タイルに表示する人物像キーワード（日本人向け・日本語）。
 * size: xl(主役・中心) > lg > md > sm。accent で緑バッジ。
 * 出典: README / note 記事から人物像が伝わるものを採用。
 */
export const keywords: Keyword[] = [
  { label: "ものづくり", size: "xl", accent: true },

  { label: "生成AI", size: "lg" },
  { label: "弓道", size: "lg", accent: true },
  { label: "3DCG", size: "lg" },
  { label: "ハッカソン", size: "lg" },
  { label: "好奇心", size: "lg", accent: true },
  { label: "視覚思考", size: "lg" },
  { label: "UIデザイン", size: "lg" },

  { label: "メタバース", size: "md" },
  { label: "空間コンピューティング", size: "md" },
  { label: "WebXR", size: "md" },
  { label: "研究", size: "md" },
  { label: "コミュニティ", size: "md" },
  { label: "茶道", size: "md", accent: true },
  { label: "写真", size: "md" },
  { label: "映像制作", size: "md" },
  { label: "フルスタック", size: "md" },

  { label: "モーショングラフィックス", size: "sm" },
  { label: "映画・アニメ", size: "sm" },
  { label: "一人旅", size: "sm" },
  { label: "サウナ", size: "sm" },
  { label: "メンター", size: "sm" },
  { label: "OSS", size: "sm" },
  { label: "自宅サーバー", size: "sm" },
  { label: "Apple好き", size: "sm" },
  { label: "恩送り", size: "sm" },
  { label: "長崎", size: "sm" },
];
