"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR と CSR で表示が一致するよう、mounted まではニュートラルな見た目に固定する。
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="テーマを切り替え"
        disabled
      >
        <Sun className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? "ライトモードに切り替え" : "ダークモードに切り替え";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={() => setTheme(nextTheme)}
          />
        }
      >
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
