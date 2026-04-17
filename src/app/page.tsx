import { AboutTile } from "@/components/bento/about-tile";
import { ContactTile } from "@/components/bento/contact-tile";
import { FeaturedTile } from "@/components/bento/featured-tile";
import { HeroTile } from "@/components/bento/hero-tile";
import { PhotoTile } from "@/components/bento/photo-tile";
import { TechStackTile } from "@/components/bento/tech-stack-tile";
import {
  BentoMotionContainer,
  BentoTileMotion,
} from "@/components/motion/bento-tile-motion";
import { profile } from "@/content/profile";

/**
 * photos 配列のレイアウト契約:
 *   [0] → 4-col 大サイズ, [1] → 2-col 中サイズ, [2] → 2-col 中サイズ
 */
const PHOTO_LAYOUT = [
  { index: 1, span: "md:col-span-2 md:row-span-1" },
  { index: 0, span: "md:col-span-4 md:row-span-2" },
  { index: 2, span: "md:col-span-2 md:row-span-1" },
] as const;

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <BentoMotionContainer className="grid grid-cols-1 gap-4 md:grid-flow-row-dense md:grid-cols-6">
        <BentoTileMotion className="md:col-span-6 md:row-span-2">
          <HeroTile className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="md:col-span-4 md:row-span-2">
          <AboutTile className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="md:col-span-2 md:row-span-1">
          <TechStackTile className="h-full" />
        </BentoTileMotion>
        <BentoTileMotion className="md:col-span-2 md:row-span-1">
          <ContactTile className="h-full" />
        </BentoTileMotion>
        {PHOTO_LAYOUT.map(({ index, span }) => {
          const photo = profile.photos.at(index);
          if (!photo) return null;
          return (
            <BentoTileMotion key={photo.src} className={span}>
              <PhotoTile photo={photo} className="h-full" />
            </BentoTileMotion>
          );
        })}
        <BentoTileMotion className="md:col-span-6 md:row-span-1">
          <FeaturedTile className="h-full" />
        </BentoTileMotion>
      </BentoMotionContainer>
    </section>
  );
}
