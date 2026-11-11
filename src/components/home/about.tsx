import Image from "next/image";

import { Section } from "@/components/home/section";
import { profile } from "@/content/profile";

export function About() {
  const { summary, bio, titles, photos } = profile;

  return (
    <Section id="about" label="About">
      <div className="space-y-4 text-base leading-relaxed text-foreground">
        {summary.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {bio && bio.length > 0 ? (
        <details className="group mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-accent group-open:mb-4">
            続きを読む
          </summary>
          <div className="space-y-4 text-base leading-relaxed text-foreground">
            {bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
      ) : null}

      {titles.length > 0 ? (
        <ul className="mt-8 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {titles.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : null}

      {photos.length > 0 ? (
        <ul className="-mx-5 mt-8 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
          {photos.map((photo) => (
            <li key={photo.src} className="shrink-0">
              <figure className="w-40">
                <div className="relative h-28 w-40 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="mt-2 text-xs leading-snug text-muted-foreground">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
