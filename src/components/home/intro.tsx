import Image from "next/image";

import { SocialLinks } from "@/components/shared/social-links";
import { profile } from "@/content/profile";
import { getPrimarySocial } from "@/content/social";

/**
 * ホームのファーストビュー。ラベルなしで、名前・肩書き・所属・モットー・SNS を縦に並べる。
 */
export function Intro() {
  const { name, headline, affiliation, lab, motto, image } = profile;

  return (
    <section aria-label="自己紹介" className="pt-10 pb-12 md:pt-16 md:pb-16">
      {image ? (
        <Image
          src={image}
          alt={`${name}のプロフィール写真`}
          width={160}
          height={160}
          priority
          className="size-20 rounded-full object-cover md:size-24"
        />
      ) : (
        <div
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground md:size-24"
        >
          {name.charAt(0)}
        </div>
      )}
      <h1
        data-intro-name
        className="mt-5 text-3xl font-bold tracking-tight md:text-4xl"
      >
        {name}
      </h1>
      <p data-intro-headline className="mt-2 text-base text-foreground">
        {headline}
      </p>
      <p data-intro-affiliation className="mt-1 text-sm text-muted-foreground">
        {affiliation.role} · {affiliation.school} ·{" "}
        <a
          href={lab.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          {lab.name}
        </a>
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {motto}
      </p>
      <div data-intro-social className="mt-5">
        <SocialLinks links={getPrimarySocial()} />
      </div>
    </section>
  );
}
