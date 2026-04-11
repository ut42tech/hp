import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.description}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * サイト全体の OG 画像。indigo グラデーション背景にプロフィール情報を載せる。
 * 外部フォントは読まず ImageResponse デフォルトの sans を使う(日本語もレンダリング可能)。
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0b0b12 0%, #15162c 45%, #1e1b4b 100%)",
        color: "#f5f5f7",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: 28,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#a5b4fc",
        }}
      >
        <span
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "999px",
            background: "#818cf8",
          }}
        />
        Portfolio
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#c7d2fe",
            fontWeight: 500,
          }}
        >
          {profile.role}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 28,
          color: "#8b8ba7",
        }}
      >
        <span>{site.url.replace("https://", "")}</span>
        <span>Projects · OSS · Research · Experience</span>
      </div>
    </div>,
    { ...size },
  );
}
