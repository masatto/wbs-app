import { describe, expect, it } from "vitest";
import { addDays, daysBetween, daysToPercent } from "./dateMath";

describe("daysBetween", () => {
  it("returns 0 for the same date", () => {
    expect(daysBetween("2026-10-01", "2026-10-01")).toBe(0);
  });

  it("returns a positive number of days when `to` is after `from`", () => {
    expect(daysBetween("2026-10-01", "2026-10-05")).toBe(4);
  });

  it("returns a negative number of days when `to` is before `from`", () => {
    expect(daysBetween("2026-10-05", "2026-10-01")).toBe(-4);
  });

  it("handles a gap spanning a month boundary", () => {
    expect(daysBetween("2026-09-28", "2026-10-02")).toBe(4);
  });
});

describe("addDays", () => {
  it("returns the same date when adding 0 days", () => {
    expect(addDays("2026-10-01", 0)).toBe("2026-10-01");
  });

  it("adds days within the same month", () => {
    expect(addDays("2026-10-01", 4)).toBe("2026-10-05");
  });

  it("handles a gap spanning a month boundary", () => {
    expect(addDays("2026-09-28", 4)).toBe("2026-10-02");
  });

  it("is the inverse of daysBetween", () => {
    const from = "2026-09-28";
    const to = "2026-10-15";
    expect(addDays(from, daysBetween(from, to))).toBe(to);
  });
});

describe("daysToPercent", () => {
  it("returns 0 when days is 0", () => {
    expect(daysToPercent(0, 30)).toBe(0);
  });

  it("returns 100 when days equals totalDays", () => {
    expect(daysToPercent(30, 30)).toBe(100);
  });

  it("returns the proportional percentage", () => {
    expect(daysToPercent(5, 30)).toBeCloseTo(16.67, 1);
  });

  it("can exceed 100 when days is greater than totalDays", () => {
    // 実績が計画の範囲をはみ出すケース（実績バーがタイムライン全体より
    // 長くなる場合）でも、特別扱いせずそのまま計算する。
    expect(daysToPercent(40, 30)).toBeCloseTo(133.33, 1);
  });
});
