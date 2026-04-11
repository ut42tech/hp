"use client";

import { useMemo, useState } from "react";

import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/components/works/category-filter";
import { WorkCard } from "@/components/works/work-card";
import type { Work } from "@/content/types";

interface WorksGridProps {
  works: Work[];
}

export function WorksGrid({ works }: WorksGridProps) {
  const [filter, setFilter] = useState<CategoryFilterValue>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return works;
    return works.filter((work) => work.category === filter);
  }, [filter, works]);

  return (
    <div className="flex flex-col gap-8">
      <CategoryFilter value={filter} onValueChange={setFilter} />
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          該当する Works はありません。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((work) => (
            <li key={work.slug}>
              <WorkCard work={work} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
