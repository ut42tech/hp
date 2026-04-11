import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FadeIn } from "@/components/motion/fade-in";
import { WorkDetail } from "@/components/works/work-detail";
import { getWorkBySlug, works } from "@/content/works";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) return {};

  return {
    title: work.title,
    description: work.summary,
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: {
      type: "article",
      locale: site.locale,
      title: work.title,
      description: work.summary,
      url: `${site.url}/works/${work.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: work.title,
      description: work.summary,
    },
  };
}

export default async function WorkDetailPage({
  params,
}: PageProps<"/works/[slug]">) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <FadeIn>
        <WorkDetail work={work} />
      </FadeIn>
    </section>
  );
}
