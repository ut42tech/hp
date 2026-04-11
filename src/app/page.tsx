import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Card className="rounded-3xl border-border bg-card p-6 md:p-8">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl font-extrabold tracking-tight md:text-5xl">
            {site.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-base text-muted-foreground">{site.description}</p>
          <p className="mt-6 text-sm text-muted-foreground">
            Phase B placeholder — Bento グリッドと About / Works
            は以降のフェーズで実装します。
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
