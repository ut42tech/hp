import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { navItems } from "@/lib/navigation";
import { site } from "@/lib/site";

const linkClass =
  "rounded-sm text-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className={`${linkClass} whitespace-nowrap text-base font-bold tracking-tight`}
        >
          {site.name}
        </Link>
        <nav
          aria-label="グローバルナビゲーション"
          className="flex items-center gap-4"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass} -mx-2 inline-flex min-h-11 items-center px-2`}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
