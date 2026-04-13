import type { Metadata } from "next";

import { GalleryCard } from "@/components/gallery/gallery-card";
import { FadeIn } from "@/components/motion/fade-in";
import { galleryPhotos } from "@/content/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "写真ギャラリー。日常や活動の様子を写真で紹介しています。",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const sorted = [...galleryPhotos].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date < b.date ? 1 : -1;
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <FadeIn>
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Gallery
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            日常や活動の様子を写真で紹介しています。写真をクリックすると日付とコメントが見られます。
          </p>
        </header>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {sorted.map((photo) => (
            <GalleryCard key={photo.src} photo={photo} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
