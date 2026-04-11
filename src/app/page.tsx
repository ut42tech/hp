import { AboutTile } from "@/components/bento/about-tile";
import { ContactTile } from "@/components/bento/contact-tile";
import { FeaturedTile } from "@/components/bento/featured-tile";
import { HeroTile } from "@/components/bento/hero-tile";
import { TechStackTile } from "@/components/bento/tech-stack-tile";
import {
  BentoMotionContainer,
  BentoTileMotion,
} from "@/components/motion/bento-tile-motion";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <BentoMotionContainer className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-4">
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
        <BentoTileMotion className="md:col-span-6 md:row-span-1">
          <FeaturedTile className="h-full" />
        </BentoTileMotion>
      </BentoMotionContainer>
    </section>
  );
}
