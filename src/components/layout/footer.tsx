import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 w-full">
      <div className="mx-auto max-w-6xl px-6">
        <Separator />
        <div className="flex flex-col items-start justify-between gap-2 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>
            © {year} {site.name}
          </p>
          <p className="text-xs">Built with Next.js, Tailwind CSS, shadcn/ui</p>
        </div>
      </div>
    </footer>
  );
}
