import { describe, expect, it } from "vitest";

import { utc } from "@/test/utc";
import { getWeekDates } from "../dates/get-week-dates";
import { toDateString } from "../dates/week";
import { buildOccurrences, type LoadedTask } from "./build-occurrences";

// The week of Monday, Oct 19, 2026
const weekDates = getWeekDates(utc("2026-10-19"));

type Rule = LoadedTask["rules"][number];

// A repeating rule on Mondays and Wednesdays that started two weeks earlier
function makeRule(fields: Partial<Rule> = {}): Rule {
  return {
    id: "rule-1",
    text: "Gym",
    days: ["MON", "WED"],
    repeating: true,
    effectiveFrom: utc("2026-10-05"),
    effectiveTo: null,
    endDate: null,
    label: null,
    ...fields,
  };
}

// A task with one rule, and nothing ticked, skipped or edited
function makeTask(fields: Partial<LoadedTask> = {}): LoadedTask {
  return {
    id: "task-1",
    deletedFrom: null,
    rules: [makeRule()],
    completions: [],
    skips: [],
    overrides: [],
    ...fields,
  };
}

// The dates of the cards, as "YYYY-MM-DD", so expectations stay short
function cardDates(tasks: LoadedTask[]) {
  return buildOccurrences(tasks, weekDates).map((occurrence) =>
    toDateString(occurrence.date),
  );
}

describe("buildOccurrences", () => {
  it("shows a repeating task on each selected weekday", () => {
    expect(cardDates([makeTask()])).toEqual(["2026-10-19", "2026-10-21"]);
  });

  it("shows a one-off task only on its date", () => {
    const task = makeTask({
      rules: [
        makeRule({
          repeating: false,
          days: ["THU"],
          effectiveFrom: utc("2026-10-22"),
        }),
      ],
    });

    expect(cardDates([task])).toEqual(["2026-10-22"]);
  });

  it.each([
    {
      rule: "keeps the card on the end date itself",
      task: makeTask({ rules: [makeRule({ endDate: utc("2026-10-19") })] }),
      cards: ["2026-10-19"],
    },
    {
      rule: "hides cards before a rule starts",
      task: makeTask({
        rules: [makeRule({ effectiveFrom: utc("2026-10-20") })],
      }),
      cards: ["2026-10-21"],
    },
    {
      rule: "hides cards after a rule version is closed",
      task: makeTask({ rules: [makeRule({ effectiveTo: utc("2026-10-20") })] }),
      cards: ["2026-10-19"],
    },
    {
      rule: "hides cards from the deletedFrom date on",
      task: makeTask({ deletedFrom: utc("2026-10-21") }),
      cards: ["2026-10-19"],
    },
    {
      rule: "hides a card deleted with This Task Only",
      task: makeTask({ skips: [{ date: utc("2026-10-19") }] }),
      cards: ["2026-10-21"],
    },
    {
      rule: "hides a one-off task from another week",
      task: makeTask({
        rules: [
          makeRule({
            repeating: false,
            days: ["THU"],
            effectiveFrom: utc("2026-10-29"),
          }),
        ],
      }),
      cards: [],
    },
  ])("$rule", ({ task, cards }) => {
    expect(cardDates([task])).toEqual(cards);
  });

  it("shows the old rule before a split and the new rule from it", () => {
    // Saved with This and Future Tasks on Wed 21: Gym on Mon/Wed became Swim on Wed/Fri
    const task = makeTask({
      rules: [
        makeRule({ effectiveTo: utc("2026-10-20") }),
        makeRule({
          id: "rule-2",
          text: "Swim",
          days: ["WED", "FRI"],
          effectiveFrom: utc("2026-10-21"),
        }),
      ],
    });

    expect(buildOccurrences([task], weekDates)).toMatchObject([
      { date: utc("2026-10-19"), ruleId: "rule-1", text: "Gym" },
      { date: utc("2026-10-21"), ruleId: "rule-2", text: "Swim" },
      { date: utc("2026-10-23"), ruleId: "rule-2", text: "Swim" },
    ]);
  });

  it("shows a tick and a This Task Only edit on their own card only", () => {
    const task = makeTask({
      completions: [{ date: utc("2026-10-19") }],
      overrides: [
        { date: utc("2026-10-21"), text: "Gym with Sam", label: "ORANGE" },
      ],
    });

    expect(buildOccurrences([task], weekDates)).toMatchObject([
      { date: utc("2026-10-19"), completed: true, text: "Gym", label: null },
      {
        date: utc("2026-10-21"),
        completed: false,
        text: "Gym with Sam",
        label: "ORANGE",
      },
    ]);
  });
});
