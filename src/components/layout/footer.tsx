import Link from "next/link";

import { SocialLinks } from "@/components/shared/social-links";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/works", label: "Works" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 w-full">
      <div className="mx-auto max-w-6xl px-6">
        <Separator />
        <div className="flex flex-col gap-8 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-base font-bold tracking-tight">{site.name}</p>
              <nav
                aria-label="フッターナビゲーション"
                className="flex flex-wrap gap-4"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Connect
              </p>
              <SocialLinks size="sm" />
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
            <p>
              © {year} {site.name}
            </p>
            <p>Built with Next.js, Tailwind CSS, shadcn/ui</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
