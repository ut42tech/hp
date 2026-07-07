import { describe, expect, it } from "vitest";

import {
  mapPress,
  mapProject,
  mapTimelineEntry,
  mapWork,
  parseTags,
  toJstDateString,
} from "./mappers";
import type { RawPress, RawProject, RawTimelineEntry, RawWork } from "./types";

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

const rawPress: RawPress = {
  id: "abc",
  title: "掲載記事",
  outlet: "長崎のWA!",
  url: "https://example.com/article",
  date: "2025-10-31T15:00:00.000Z",
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
      thumbnail: "https://images.microcms-assets.io/x/press.jpg",
      excerpt: "取材いただきました。",
    });
  });

  it("空文字 excerpt は undefined になる", () => {
    expect(mapPress({ ...rawPress, excerpt: "" }).excerpt).toBeUndefined();
  });
});

const rawProject: RawProject = {
  id: "coto2-ba",
  title: "コトコトバ",
  summary: "受賞作品。",
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

describe("mapProject", () => {
  it("contentId を slug として Project に変換する", () => {
    expect(mapProject(rawProject)).toEqual({
      slug: "coto2-ba",
      title: "コトコトバ",
      summary: "受賞作品。",
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

  it("未知の link kind は other にフォールバックする", () => {
    const mapped = mapProject({
      ...rawProject,
      links: [{ fieldId: "link", label: "L", href: "https://a", kind: ["x"] }],
    });
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
      thumbnail: undefined,
    });
  });

  it("thumbnail の URL をマップする", () => {
    const mapped = mapTimelineEntry({
      ...rawTimeline,
      thumbnail: { url: "https://images.microcms-assets.io/x/t.jpg" },
    });
    expect(mapped.thumbnail).toBe("https://images.microcms-assets.io/x/t.jpg");
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

const rawWork: RawWork = {
  id: "chotech",
  title: "学生エンジニアコミュニティ ChoTech 設立・運営",
  summary: "長崎の学生エンジニアコミュニティを設立し、代表として運営。",
  date: "2025-03-31T15:00:00.000Z",
  url: "https://example.com/chotech",
};

describe("mapWork", () => {
  it("contentId を slug として Work に変換する", () => {
    expect(mapWork(rawWork)).toEqual({
      slug: "chotech",
      title: "学生エンジニアコミュニティ ChoTech 設立・運営",
      summary: "長崎の学生エンジニアコミュニティを設立し、代表として運営。",
      date: "2025-04-01",
      url: "https://example.com/chotech",
      thumbnail: undefined,
    });
  });

  it("未設定・空文字の url は undefined になる", () => {
    expect(mapWork({ ...rawWork, url: undefined }).url).toBeUndefined();
    expect(mapWork({ ...rawWork, url: "" }).url).toBeUndefined();
  });
});
