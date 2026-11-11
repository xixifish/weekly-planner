import { LabelColour, Weekday } from "@/app/generated/prisma/enums";

import { addDays, getWeekStart } from "../dates/week";

// One task a new guest starts with
export type SampleTask = {
  text: string;
  days: Weekday[];
  repeating: boolean;
  effectiveFrom: Date;
  label: LabelColour | null;
  // The dates this task is already ticked on
  completedOn: Date[];
};

// The tasks a guest sees straight away, placed around the week of `today`
export function buildSampleTasks(today: Date): SampleTask[] {
  const weekStart = getWeekStart(today);
  // Repeating tasks start two weeks back, so earlier weeks have cards too
  const repeatingFrom = addDays(weekStart, -14);

  return [
    {
      text: "Morning run",
      days: ["MON", "WED", "FRI"],
      repeating: true,
      effectiveFrom: repeatingFrom,
      label: "GREEN",
      completedOn: [
        addDays(weekStart, 0),
        addDays(weekStart, 2),
        addDays(weekStart, 4),
      ],
    },
    {
      text: "Team stand-up",
      days: ["MON", "TUE", "WED", "THU", "FRI"],
      repeating: true,
      effectiveFrom: repeatingFrom,
      label: "BLUE",
      completedOn: [addDays(weekStart, 0)],
    },
    {
      text: "Kids' school event",
      days: ["FRI"],
      repeating: false,
      effectiveFrom: addDays(weekStart, 4),
      label: "PINK",
      completedOn: [],
    },
    {
      text: "Read",
      days: ["FRI", "SAT", "SUN"],
      repeating: true,
      effectiveFrom: repeatingFrom,
      label: "YELLOW",
      completedOn: [addDays(weekStart, 4)],
    },
    {
      text: "Dinner with friends",
      days: ["WED"],
      repeating: false,
      effectiveFrom: addDays(weekStart, 2),
      label: null,
      completedOn: [],
    },
  ];
}
