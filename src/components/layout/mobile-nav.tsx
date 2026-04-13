"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="メニューを開く">
          <Menu className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">ナビゲーション</DrawerTitle>
        <nav
          aria-label="モバイルナビゲーション"
          className="flex flex-col gap-1 p-6"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-muted",
                pathname === item.href ? "text-accent" : "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border px-6 py-4">
          <ThemeToggle />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
