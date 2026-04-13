import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { navItems } from "@/lib/navigation";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="rounded-sm text-base font-bold tracking-tight transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {site.name}
        </Link>
        {/* デスクトップナビ */}
        <nav
          aria-label="グローバルナビゲーション"
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={buttonVariants({
                variant: "link",
                size: "default",
              })}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>
        {/* モバイルナビ */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
