import { describe, expect, it } from "vitest";
import { daysBetween } from "./dateMath";

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
