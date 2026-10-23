import { describe, expect, it } from "vitest";

import { getWeekStart } from "./week";

describe("getWeekStart", () => {
  it("returns the Monday of a midweek date", () => {
    const wednesday = new Date("2026-10-21T00:00:00.000Z");

    expect(getWeekStart(wednesday)).toEqual(
      new Date("2026-10-19T00:00:00.000Z"),
    );
  });
});
