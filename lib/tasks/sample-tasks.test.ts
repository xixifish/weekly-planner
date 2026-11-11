import { describe, expect, it } from "vitest";

import { utc } from "@/test/utc";
import { buildSampleTasks } from "./sample-tasks";

import { getWeekday } from "../dates/week";

describe("buildSampleTasks", () => {
  // Wednesday, Nov 11, 2026; its week starts on Monday, Nov 9
  const tasks = buildSampleTasks(utc("2026-11-11"));

  it("starts the repeating tasks two weeks before this week", () => {
    const repeating = tasks.filter((task) => task.repeating);

    expect(repeating.length).toBeGreaterThan(0);
    for (const task of repeating) {
      expect(task.effectiveFrom).toEqual(utc("2026-10-26"));
    }
  });

  it("puts each one-off task on its own day of this week", () => {
    const oneOffs = tasks.filter((task) => !task.repeating);

    expect(oneOffs.length).toBeGreaterThan(0);
    for (const task of oneOffs) {
      // The date is the weekday the task says
      expect(task.days).toEqual([getWeekday(task.effectiveFrom)]);
      // And it falls in the week of Nov 9 - Nov 15
      expect(task.effectiveFrom >= utc("2026-11-09")).toBe(true);
      expect(task.effectiveFrom <= utc("2026-11-15")).toBe(true);
    }
  });

  it("only ticks days the task shows on", () => {
    const ticked = tasks.filter((task) => task.completedOn.length > 0);

    expect(ticked.length).toBeGreaterThan(0);
    for (const task of ticked) {
      for (const date of task.completedOn) {
        expect(task.days).toContain(getWeekday(date));
      }
    }
  });
});
