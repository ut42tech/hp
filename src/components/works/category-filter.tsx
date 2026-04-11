"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkCategory } from "@/content/types";
import { workCategories } from "@/content/works";

export type CategoryFilterValue = WorkCategory | "all";

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onValueChange: (next: CategoryFilterValue) => void;
}

export function CategoryFilter({ value, onValueChange }: CategoryFilterProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as CategoryFilterValue)}
    >
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        {workCategories.map((category) => (
          <TabsTrigger key={category.value} value={category.value}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
