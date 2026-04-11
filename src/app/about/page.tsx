import type { Metadata } from "next";
import Image from "next/image";

import { Timeline } from "@/components/about/timeline";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: `${profile.name} の経歴・略歴。生まれから現在までの学歴・職歴・イベント参加をタイムライン形式で紹介します。`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <FadeIn>
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center">
          {profile.image ? (
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border shadow-md md:size-32">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                sizes="(min-width: 768px) 8rem, 6rem"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              About
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {profile.name}
            </h1>
            <p className="text-base text-muted-foreground">{profile.role}</p>
            <p className="text-xs text-muted-foreground">
              {profile.affiliation}
            </p>
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="mb-12 flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-foreground md:text-base">
            {profile.bio}
          </p>
          <ul className="flex flex-wrap gap-2">
            {profile.techStack.map((tech) => (
              <li key={tech}>
                <Badge variant="secondary" className="font-medium">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Timeline</h2>
          <Timeline entries={profile.timeline} />
        </div>
      </FadeIn>
    </section>
  );
}
