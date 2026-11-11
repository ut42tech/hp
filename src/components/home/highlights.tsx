import { Section } from "@/components/home/section";
import type { Highlight } from "@/content/types";

const CARD_CLASS =
  "block snap-start shrink-0 w-[80%] rounded-xl border border-border/60 p-4 md:w-[calc((100%-2rem)/3)]";

/** "2026-03-15" → "2026.03" */
function formatYearMonth(date: string): string {
  return date.slice(0, 7).replace("-", ".");
}

function CardBody({ item }: { item: Highlight }) {
  return (
    <>
      <p className="text-xs tabular-nums text-muted-foreground">
        {formatYearMonth(item.date)}
      </p>
      <p className="mt-2 text-base font-medium leading-snug text-foreground">
        {item.title}
      </p>
      {item.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      ) : null}
    </>
  );
}

/** 代表的な Work / 経歴を横スワイプで見せる。ホームで唯一のカード UI。 */
export function Highlights({ items }: { items: Highlight[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="highlights" label="Highlights">
      <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 md:scroll-px-0 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
        {items.map((item) => (
          <li key={`${item.kind}-${item.title}`} className="contents">
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${CARD_CLASS} transition-colors hover:border-accent`}
              >
                <CardBody item={item} />
              </a>
            ) : (
              <div className={CARD_CLASS}>
                <CardBody item={item} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
