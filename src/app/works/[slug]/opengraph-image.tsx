import { ImageResponse } from "next/og";

import { getWorkBySlug, works } from "@/content/works";
import { ogColors, site } from "@/lib/site";

export const alt = "Work";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

/**
 * Work 詳細ページの OG 画像。カテゴリ + タイトル + サマリを並べる。
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ogColors.bgSolid,
          color: ogColors.fg,
          fontSize: 64,
          fontFamily: "sans-serif",
        }}
      >
        Work not found
      </div>,
      { ...size },
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: ogColors.bg,
        color: ogColors.fg,
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
          color: ogColors.accent,
        }}
      >
        <span
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "999px",
            background: ogColors.accentDot,
          }}
        />
        {work.category}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {work.title}
        </div>
        <div
          style={{
            fontSize: 32,
            color: ogColors.accentLight,
            lineHeight: 1.4,
            maxWidth: "900px",
          }}
        >
          {work.summary}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 24,
          color: ogColors.muted,
        }}
      >
        <span>
          {site.url.replace("https://", "")}/works/{work.slug}
        </span>
        <span>{work.date}</span>
      </div>
    </div>,
    { ...size },
  );
}
