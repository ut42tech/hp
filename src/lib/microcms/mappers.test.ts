import { describe, expect, it } from "vitest";

import {
  filterProjects,
  mapPress,
  mapTimelineEntry,
  mapWork,
  parseBody,
  parseTags,
  toJstDateString,
} from "./mappers";
import type { RawPress, RawTimelineEntry, RawWork } from "./types";

describe("toJstDateString", () => {
  it("JST で選んだ日付（前日 15:00Z）を正しい日付に戻す", () => {
    expect(toJstDateString("2026-03-31T15:00:00.000Z")).toBe("2026-04-01");
  });

  it("UTC 深夜 0 時はそのままの日付になる", () => {
    expect(toJstDateString("2026-04-01T00:00:00.000Z")).toBe("2026-04-01");
  });
});

describe("parseTags", () => {
  it("カンマ区切りを trim して配列にする", () => {
    expect(parseTags("Next.js, FastAPI , AWS")).toEqual([
      "Next.js",
      "FastAPI",
      "AWS",
    ]);
  });

  it("未設定・空文字は空配列", () => {
    expect(parseTags(undefined)).toEqual([]);
    expect(parseTags("")).toEqual([]);
  });
});

describe("parseBody", () => {
  it("空行区切りで段落に分割する", () => {
    expect(parseBody("一段落目。\n\n二段落目。")).toEqual([
      "一段落目。",
      "二段落目。",
    ]);
  });

  it("未設定・空文字は undefined", () => {
    expect(parseBody(undefined)).toBeUndefined();
    expect(parseBody("")).toBeUndefined();
  });
});

const rawPress: RawPress = {
  id: "abc",
  title: "掲載記事",
  outlet: "長崎のWA!",
  url: "https://example.com/article",
  date: "2025-10-31T15:00:00.000Z",
  type: ["interview"],
  thumbnail: { url: "https://images.microcms-assets.io/x/press.jpg" },
  excerpt: "取材いただきました。",
};

describe("mapPress", () => {
  it("PressItem に変換する", () => {
    expect(mapPress(rawPress)).toEqual({
      title: "掲載記事",
      outlet: "長崎のWA!",
      url: "https://example.com/article",
      date: "2025-11-01",
      type: "interview",
      thumbnail: "https://images.microcms-assets.io/x/press.jpg",
      excerpt: "取材いただきました。",
    });
  });

  it("未知の type は media にフォールバックする", () => {
    expect(mapPress({ ...rawPress, type: ["unknown"] }).type).toBe("media");
  });

  it("空文字 excerpt は undefined になる", () => {
    expect(mapPress({ ...rawPress, excerpt: "" }).excerpt).toBeUndefined();
  });
});

const rawWork: RawWork = {
  id: "coto2-ba",
  title: "コトコトバ",
  category: ["project"],
  summary: "受賞作品。",
  body: "一段落目。\n\n二段落目。",
  date: "2026-03-14T15:00:00.000Z",
  tags: "Award, Hackathon",
  links: [
    {
      fieldId: "link",
      label: "GitHub",
      href: "https://github.com/nu-chotech/coto2-ba",
      kind: ["github"],
    },
  ],
};

describe("mapWork", () => {
  it("contentId を slug として Work に変換する", () => {
    expect(mapWork(rawWork)).toEqual({
      slug: "coto2-ba",
      category: "project",
      title: "コトコトバ",
      summary: "受賞作品。",
      body: ["一段落目。", "二段落目。"],
      date: "2026-03-15",
      tags: ["Award", "Hackathon"],
      thumbnail: undefined,
      links: [
        {
          label: "GitHub",
          href: "https://github.com/nu-chotech/coto2-ba",
          kind: "github",
        },
      ],
    });
  });

  it("未知の category は project、未知の link kind は other にフォールバックする", () => {
    const mapped = mapWork({
      ...rawWork,
      category: ["unknown"],
      links: [{ fieldId: "link", label: "L", href: "https://a", kind: ["x"] }],
    });
    expect(mapped.category).toBe("project");
    expect(mapped.links[0]?.kind).toBe("other");
  });
});

const rawTimeline: RawTimelineEntry = {
  id: "t1",
  title: "大学院に進学",
  date: "2026-03-31T15:00:00.000Z",
  category: ["education"],
  description: "瀬戸崎研究室に継続所属。",
  location: "長崎大学",
};

describe("mapTimelineEntry", () => {
  it("TimelineEntry に変換する", () => {
    expect(mapTimelineEntry(rawTimeline)).toEqual({
      date: "2026-04-01",
      category: "education",
      title: "大学院に進学",
      description: "瀬戸崎研究室に継続所属。",
      location: "長崎大学",
    });
  });

  it("未知の category は other、空文字 description/location は undefined", () => {
    const mapped = mapTimelineEntry({
      ...rawTimeline,
      category: ["unknown"],
      description: "",
      location: "",
    });
    expect(mapped.category).toBe("other");
    expect(mapped.description).toBeUndefined();
    expect(mapped.location).toBeUndefined();
  });
});

describe("filterProjects", () => {
  const base = { title: "t", summary: "s", tags: [], links: [] };

  it("project/oss/research のみ返し experience を除外する", () => {
    const list = filterProjects([
      { ...base, slug: "a", category: "project", date: "2026-01-01" },
      { ...base, slug: "b", category: "experience", date: "2026-02-01" },
      { ...base, slug: "c", category: "oss", date: "2026-03-01" },
      { ...base, slug: "d", category: "research", date: "2026-04-01" },
    ]);
    expect(list.map((w) => w.slug)).toEqual(["d", "c", "a"]);
  });

  it("日付降順に並ぶ", () => {
    const list = filterProjects([
      { ...base, slug: "old", category: "project", date: "2024-01-01" },
      { ...base, slug: "new", category: "project", date: "2026-01-01" },
    ]);
    expect(list.map((w) => w.slug)).toEqual(["new", "old"]);
  });
});
