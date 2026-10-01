import { describe, expect, it } from "vitest";
import type { WbsItem } from "../types/wbsItem";
import { buildWbsTree } from "./buildWbsTree";

// WbsItemに必須フィールドが増えるたびに、このテストの全オブジェクトを
// 直すのを避けるためのファクトリ。デフォルト値はここ1箇所にまとめ、
// テストごとに必要な値だけoverridesで上書きする。
function makeItem(overrides: Partial<WbsItem> & Pick<WbsItem, "id">): WbsItem {
  return {
    name: "task",
    parentId: null,
    startDate: "2026-10-01",
    endDate: "2026-10-05",
    progress: 0,
    orderIndex: 1,
    status: "NOT_STARTED",
    priority: "MEDIUM",
    assignee: null,
    effortDays: null,
    actualStartDate: null,
    actualEndDate: null,
    ...overrides,
  };
}

const items: WbsItem[] = [
  makeItem({
    id: 1,
    name: "要件定義",
    parentId: null,
    startDate: "2026-10-01",
    endDate: "2026-10-05",
    orderIndex: 1,
  }),
  makeItem({
    id: 2,
    name: "画面設計",
    parentId: 1,
    startDate: "2026-10-06",
    endDate: "2026-10-10",
    orderIndex: 1,
  }),
  makeItem({
    id: 3,
    name: "DB設計",
    parentId: 1,
    startDate: "2026-10-06",
    endDate: "2026-10-10",
    orderIndex: 2,
  }),
  makeItem({
    id: 4,
    name: "詳細設計",
    parentId: 2,
    startDate: "2026-10-11",
    endDate: "2026-10-15",
    orderIndex: 1,
  }),
];

describe("buildWbsTree", () => {
  it("returns an empty array for an empty input", () => {
    expect(buildWbsTree([])).toEqual([]);
  });

  it("puts items with parentId=null at the top level", () => {
    const tree = buildWbsTree(items);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe(1);
    expect(tree[0].name).toBe("要件定義");
  });

  it("nests children under their parent, in original order", () => {
    const tree = buildWbsTree(items);

    expect(tree[0].children.map((c) => c.id)).toEqual([2, 3]);
  });

  it("nests grandchildren under their parent", () => {
    const tree = buildWbsTree(items);
    const screenDesign = tree[0].children[0];

    expect(screenDesign.id).toBe(2);
    expect(screenDesign.children).toHaveLength(1);
    expect(screenDesign.children[0].id).toBe(4);
  });

  it("gives leaf nodes an empty children array", () => {
    const tree = buildWbsTree(items);
    const dbDesign = tree[0].children[1];

    expect(dbDesign.id).toBe(3);
    expect(dbDesign.children).toEqual([]);
  });
});
