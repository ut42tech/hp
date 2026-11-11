import Link from "next/link";

import { SocialLinks } from "@/components/shared/social-links";
import { profile } from "@/content/profile";
import { navItems } from "@/lib/navigation";
import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 w-full border-t border-border">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="フッターナビゲーション"
            className="flex flex-wrap gap-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <SocialLinks links={profile.social} size="sm" />
        </div>
        <p className="text-xs text-muted-foreground">
          © {year} {site.name}
        </p>
      </div>
    </footer>
  );
}
