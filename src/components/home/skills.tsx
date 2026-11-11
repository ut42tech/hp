import { Section } from "@/components/home/section";
import { TechStackList } from "@/components/shared/tech-stack-list";
import { profile } from "@/content/profile";
import type { TechCategory } from "@/content/types";

const CATEGORIES: { key: TechCategory; label: string }[] = [
  { key: "languages", label: "Languages" },
  { key: "web", label: "Web" },
  { key: "infra", label: "Infra / Cloud" },
  { key: "creative", label: "Creative" },
  { key: "academic", label: "Academic" },
];

export function Skills() {
  const groups = CATEGORIES.filter(
    ({ key }) => profile.techStack[key].length > 0,
  );
  if (groups.length === 0) return null;

  return (
    <Section id="skills" label="Skills">
      <div className="space-y-6">
        {groups.map(({ key, label }) => (
          <div key={key}>
            <h3 className="mb-2 text-sm font-medium text-foreground">
              {label}
            </h3>
            <TechStackList items={profile.techStack[key]} />
          </div>
        ))}
      </div>
    </Section>
  );
}
