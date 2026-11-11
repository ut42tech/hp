import Link from "next/link";
import { platformMeta } from "@/components/blog/platform-meta";
import { Section } from "@/components/home/section";
import type { PressItem } from "@/content/types";
import type { BlogPost } from "@/lib/blog/types";

interface WritingProps {
  posts: BlogPost[];
  press: PressItem[];
}

const linkClass =
  "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline";

/** ISO 日時や YYYY-MM(-DD) を YYYY.MM(.DD) に整形する。 */
function formatDate(value: string): string {
  return value.slice(0, 10).replaceAll("-", ".");
}

function Row({
  date,
  source,
  title,
  url,
}: {
  date: string;
  source: string;
  title: string;
  url: string;
}) {
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-4"
      >
        <span className="flex shrink-0 items-baseline gap-3 text-xs text-muted-foreground sm:w-40">
          <time className="tabular-nums">{formatDate(date)}</time>
          <span>{source}</span>
        </span>
        <span className="min-w-0 text-sm leading-relaxed group-hover:underline underline-offset-4">
          {title}
        </span>
      </a>
    </li>
  );
}

/**
 * ホームの Writing セクション。記事 0 件でも「記事をすべて見る」は常に表示し、
 * Press は 1 件以上あるときだけ出す。
 */
export function Writing({ posts, press }: WritingProps) {
  return (
    <Section id="writing" label="Writing">
      {posts.length > 0 && (
        <ul className="divide-y divide-border">
          {posts.map((post) => (
            <Row
              key={post.url}
              date={post.publishedAt}
              source={platformMeta[post.platform].label}
              title={post.title}
              url={post.url}
            />
          ))}
        </ul>
      )}
      <p className={posts.length > 0 ? "mt-4" : ""}>
        <Link href="/blogs" className={linkClass}>
          記事をすべて見る →
        </Link>
      </p>

      {press.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Press
          </h3>
          <ul className="divide-y divide-border">
            {press.map((item) => (
              <Row
                key={item.url || item.title}
                date={item.date}
                source={item.outlet}
                title={item.title}
                url={item.url}
              />
            ))}
          </ul>
          <p className="mt-4">
            <Link href="/press" className={linkClass}>
              掲載一覧を見る →
            </Link>
          </p>
        </div>
      )}
    </Section>
  );
}
