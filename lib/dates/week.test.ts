import { describe, expect, it } from "vitest";

import { utc } from "@/test/utc";
import { getWeekStart, parseWeekParam } from "./week";

describe("getWeekStart", () => {
  it("returns the Monday of a midweek date", () => {
    expect(getWeekStart(utc("2026-10-21"))).toEqual(utc("2026-10-19"));
  });

  it("returns the same date for a Monday", () => {
    expect(getWeekStart(utc("2026-10-19"))).toEqual(utc("2026-10-19"));
  });

  it("returns the previous Monday for a Sunday", () => {
    expect(getWeekStart(utc("2026-10-25"))).toEqual(utc("2026-10-19"));
  });
});

describe("parseWeekParam", () => {
  const today = utc("2026-10-23");

  it("uses the week of a valid ?week= date", () => {
    expect(parseWeekParam("2026-09-02", today)).toEqual(utc("2026-08-31"));
  });

  it("falls back to this week for an impossible date", () => {
    expect(parseWeekParam("2026-02-30", today)).toEqual(utc("2026-10-19"));
  });

  it("falls back to this week when ?week= is missing", () => {
    expect(parseWeekParam(undefined, today)).toEqual(utc("2026-10-19"));
  });
});
