import { Link as LinkIcon } from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

import { BlockReveal } from "./block-reveal";
import { Marquee } from "./marquee";

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
      {/* メイン：あいさつ・名前・ハッシュタグ・モットー。
          min-w-0 + overflow-hidden でマーキー（w-max）が列を押し広げてサイドバーを
          見切れさせるのを防ぐ。 */}
      <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-hidden md:justify-center">
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
          {/* 名前 "Takuya Uehara" が Safari で 1↔2 行に揺れる問題への対策（2つで1組）:
              1. テキスト列を min-w-0 flex-1 で残り幅いっぱいに広げる
              2. 名前を block で組む（BlockReveal block）
              これが無いと列も名前も固有幅(~300px)ぴったりに縮こまり、文字列が折り返し
              閾値の真上に乗る。WebKit の inline-block サブピクセル丸めで 1↔2 行が不定に
              揺れる。block＋余白なら折り返し判定がコンテナ幅で決まり、desktop は確定的に
              1行、狭いモバイルは自然に2行になる。text-balance も付けない（同様に揺らす）。 */}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Hello 👋
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
              <BlockReveal delay={0.12} block>
                {profile.name}
              </BlockReveal>
            </h1>
          </div>
        </div>

        {/* ハッシュタグは1つずつマスクで順番に登場（マスク色はテキスト色＝アクセント）。 */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-accent">
          {profile.roleTags.map((tag, i) => (
            <BlockReveal key={tag} delay={0.26 + i * 0.08}>
              #{tag}
            </BlockReveal>
          ))}
        </div>

        {/* モットー：日英を左方向へスライドし続けるマーキー。
            枠線は使わず、端のフェード（mask）でクリーンに縁取る。 */}
        <div
          className="hero-reveal text-xl font-bold leading-relaxed text-foreground md:text-2xl"
          style={{ animationDelay: "600ms" }}
        >
          <Marquee items={[profile.motto, profile.mottoEn]} />
        </div>
      </div>

      {/* サイドバー：所属・肩書き */}
      <div
        className="hero-reveal flex flex-col gap-3 border-t border-border pt-6 md:w-72 md:shrink-0 md:border-t-0 md:border-l md:pt-1 md:pl-10"
        style={{ animationDelay: "480ms" }}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            {profile.affiliation.role}
          </p>
          <p className="text-sm text-muted-foreground">
            at {profile.affiliation.school}
          </p>
        </div>
        <ul className="flex flex-col gap-1.5 text-xs leading-snug text-muted-foreground">
          {/* 研究室は肩書き一覧の先頭にリンクとして置く（所属の折り返しを防ぐ） */}
          <li className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-[5px] size-1 shrink-0 rounded-full bg-accent/70"
            />
            <a
              href={profile.lab.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
            >
              {profile.lab.name}
              <LinkIcon size={12} className="size-3 shrink-0" />
            </a>
          </li>
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
