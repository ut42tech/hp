import type { Metadata } from "next";

import { AboutTile } from "@/components/bento/about-tile";
import { BlogTeaserTile } from "@/components/bento/blog-teaser-tile";
import { ContactTile } from "@/components/bento/contact-tile";
import { HeroTile } from "@/components/bento/hero-tile";
import { PhotoTile } from "@/components/bento/photo-tile";
import { SelectedWorksTile } from "@/components/bento/selected-works-tile";
import { TechStackTile } from "@/components/bento/tech-stack-tile";
import { Timeline } from "@/components/home/timeline";
import {
  BentoMotionContainer,
  BentoTileMotion,
} from "@/components/motion/bento-tile-motion";
import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { getLatestBlogPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  description:
    "Takuya Uehara の自己紹介。Creative Engineer として、デザインとテクノロジーで最高のユーザ体験を届けることをモットーに、ソフトウェア開発・HCI 研究・コミュニティ活動に取り組んでいます。経歴・技術スタック・代表作・写真をまとめています。",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const latestPosts = await getLatestBlogPosts(3);

  // photos: [0]=タージ・マハル, [1]=富士山, [2]=アユタヤ
  const fuji = profile.photos.at(1);
  const taj = profile.photos.at(0);
  const ayutthaya = profile.photos.at(2);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <BentoMotionContainer className="grid grid-flow-row-dense grid-cols-2 gap-4 md:grid-cols-6">
        <BentoTileMotion className="col-span-2 md:col-span-6 md:row-span-2">
          <HeroTile className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-2 md:col-span-4 md:row-span-2">
          <AboutTile className="h-full" />
        </BentoTileMotion>

        <BentoTileMotion className="col-span-1 md:col-span-2">
          <TechStackTile className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="col-span-1 md:col-span-2">
          <ContactTile className="h-full" />
        </BentoTileMotion>

        {/* Journey 写真: モバイルは富士山を縦長(row-span-2)にして非対称 Bento を作る */}
        {fuji ? (
          <BentoTileMotion className="col-span-1 row-span-2 md:col-span-2 md:row-span-1">
            <PhotoTile photo={fuji} className="h-full" />
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
          <SelectedWorksTile className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="col-span-2 md:col-span-2">
          <BlogTeaserTile posts={latestPosts} className="h-full" />
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
