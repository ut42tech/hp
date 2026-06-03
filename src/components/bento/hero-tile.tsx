import { Link as LinkIcon } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

import { Typewriter } from "./typewriter";

interface HeroTileProps {
  className?: string;
}

export function HeroTile({ className }: HeroTileProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-8 rounded-3xl border-border bg-card p-8 md:flex-row md:items-stretch md:gap-10 md:p-12",
        className,
      )}
    >
      {/* メイン：あいさつ・名前・ハッシュタグ・モットー */}
      <div className="flex flex-1 flex-col gap-6 md:justify-center">
        <div className="flex items-center gap-5">
          {profile.image ? (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border ring-2 ring-border md:size-20">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground duration-500 animate-in fade-in slide-in-from-bottom-1">
              Hello 👋
            </span>
            <h1 className="text-balance text-2xl font-extrabold tracking-tight md:text-4xl">
              <Typewriter
                texts={[`I'm ${profile.name}`]}
                startDelayMs={350}
                cursorClassName="bg-foreground"
              />
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-accent">
          {profile.roleTags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>

        {/* モットー：日本語⇄英語をタイピングでループ。
            最長フレーズ（2行）ぶんの高さを確保し、ループ中に下の罫線が動かないようにする。 */}
        <p className="flex min-h-[3.6em] items-center border-l-[3px] border-accent pl-5 text-xl font-bold leading-relaxed text-foreground md:text-2xl">
          <Typewriter
            texts={[profile.motto, profile.mottoEn]}
            loop
            holdMs={2000}
            cursorClassName="bg-accent"
          />
        </p>
      </div>

      {/* サイドバー：所属・肩書き */}
      <div className="flex flex-col gap-3 border-t border-border pt-6 md:w-72 md:shrink-0 md:border-t-0 md:border-l md:pt-1 md:pl-10">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            {profile.affiliation.role}
          </p>
          <p className="text-sm text-muted-foreground">
            at {profile.affiliation.school}
          </p>
          <a
            href={profile.lab.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
          >
            {profile.lab.name}
            <LinkIcon className="size-3" />
          </a>
        </div>
        <ul className="flex flex-col gap-1.5 text-xs leading-snug text-muted-foreground">
          {profile.titles.map((title) => (
            <li key={title} className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-[5px] size-1 shrink-0 rounded-full bg-accent/70"
              />
              <span>{title}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
