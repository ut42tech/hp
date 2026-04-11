import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        404 Not Found
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
        ページが見つかりません
      </h1>
      <p className="text-base text-muted-foreground">
        お探しのページは移動または削除された可能性があります。URL
        をご確認のうえ、トップへお戻りください。
      </p>
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        トップへ戻る
      </Link>
    </section>
  );
}
