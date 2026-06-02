import type { Metadata } from "next";

import { BlogTeaserTile } from "@/components/bento/blog-teaser-tile";
import { ContactTile } from "@/components/bento/contact-tile";
import { HeroTile } from "@/components/bento/hero-tile";
import { KeywordsTile } from "@/components/bento/keywords-tile";
import { PhotoTile } from "@/components/bento/photo-tile";
import { PressTeaserTile } from "@/components/bento/press-teaser-tile";
import { TechStackTile } from "@/components/bento/tech-stack-tile";
import { Timeline } from "@/components/home/timeline";
import {
  BentoMotionContainer,
  BentoTileMotion,
} from "@/components/motion/bento-tile-motion";
import { ProjectsSection } from "@/components/projects/projects-section";
import { Card } from "@/components/ui/card";
import { getLatestPress } from "@/content/press";
import { profile } from "@/content/profile";
import { getLatestBlogPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Takuya Uehara（上原拓也）の自己紹介。学生エンジニア / フルスタックとして、デザインとテクノロジーで最高のユーザ体験を届けることをモットーに、生成AI・空間コンピューティングの研究やプロダクト開発に取り組んでいます。キーワード・代表作・掲載記事・経歴をまとめています。",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const latestPosts = await getLatestBlogPosts(3);
  const latestPress = getLatestPress(3);

  // photos: [0]=タージ・マハル, [1]=長崎ハッカソン, [2]=アユタヤ
  const hackathon = profile.photos.at(1);
  const taj = profile.photos.at(0);
  const ayutthaya = profile.photos.at(2);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <BentoMotionContainer className="grid grid-flow-row-dense grid-cols-2 gap-4 md:grid-cols-6">
        <BentoTileMotion className="col-span-2 md:col-span-6 md:row-span-2">
          <HeroTile className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-2 md:col-span-4 md:row-span-2">
          <KeywordsTile className="h-full" />
        </BentoTileMotion>

        {/*
          Tech Stack はバッジが多く、モバイルで半幅にすると極端に縦長になり、
          隣の Contact が h-full で引き伸ばされて巨大な空白になる。
          そのためモバイルでは全幅にしてバッジを自然に折り返す。
        */}
        <BentoTileMotion className="col-span-2 md:col-span-2">
          <TechStackTile className="h-full" />
        </BentoTileMotion>

        {/*
          以前は Contact + 写真を半幅で混在させ、可変高の Contact に
          引っ張られて隣の写真が h-full で不揃いにクロップされ「ずれ」が
          目立っていた。モバイルは次の縦積みに整理する:
          - Contact … 全幅
          - 長崎ハッカソン … 全幅で大きく
          - タージ・マハル / アユタヤ … 半幅2列で並べる
          写真同士は同じ 4:3 で高さが揃い、可変高の Contact と同じ行に
          入らないので不揃いクロップ(ずれ)は起きない。
          デスクトップ(md:)では Contact + 写真3枚が 6 列に並ぶ従来構成のまま。
        */}
        <BentoTileMotion className="col-span-2 md:col-span-2">
          <ContactTile className="h-full" />
        </BentoTileMotion>
        {hackathon ? (
          <BentoTileMotion className="col-span-2 md:col-span-2">
            <PhotoTile photo={hackathon} className="h-full" />
          </BentoTileMotion>
        ) : null}
        {taj ? (
          <BentoTileMotion className="col-span-1 md:col-span-2">
            <PhotoTile photo={taj} className="h-full" />
          </BentoTileMotion>
        ) : null}
        {ayutthaya ? (
          <BentoTileMotion className="col-span-1 md:col-span-2">
            <PhotoTile photo={ayutthaya} className="h-full" />
          </BentoTileMotion>
        ) : null}

        <BentoTileMotion className="col-span-2 md:col-span-4">
          <PressTeaserTile items={latestPress} className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="col-span-2 md:col-span-2">
          <BlogTeaserTile posts={latestPosts} className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-2 md:col-span-6">
          <ProjectsSection className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-2 md:col-span-6">
          <Card className="flex flex-col gap-6 rounded-3xl border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Timeline</h2>
            <Timeline entries={profile.timeline} />
          </Card>
        </BentoTileMotion>
      </BentoMotionContainer>
    </section>
  );
}
