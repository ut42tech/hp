import type { Metadata } from "next";

import { UnderConstruction } from "@/components/shared/under-construction";

export const metadata: Metadata = {
  title: "Works",
  description:
    "個人開発・OSS・研究・登壇など、これまでに取り組んできた Works の一覧。",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return <UnderConstruction title="Works" />;
}
