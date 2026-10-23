import { LabelColour, Weekday } from "@/app/generated/prisma/enums";

import { WEEKDAYS } from "../dates/week";

export type TaskOccurrence = {
  taskId: string;
  ruleId: string;
  date: Date;
  text: string;
  completed: boolean;
  label: LabelColour | null;
  days: Weekday[];
  repeating: boolean;
  endDate: Date | null;
};

// The parts of a loaded task that decide which cards it shows
export type LoadedTask = {
  id: string;
  deletedFrom: Date | null;
  rules: {
    id: string;
    text: string;
    days: Weekday[];
    repeating: boolean;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    endDate: Date | null;
    label: LabelColour | null;
  }[];
  completions: { date: Date }[];
  skips: { date: Date }[];
  overrides: { date: Date; text: string; label: LabelColour | null }[];
};

// The cards that the tasks show on the seven week dates
export function buildOccurrences(tasks: LoadedTask[], weekDates: Date[]) {
  const occurrences: TaskOccurrence[] = [];

  for (const task of tasks) {
    for (const rule of task.rules) {
      for (const date of weekDates) {
        // Does this rule create a card on this date?
        // Not start yet
        if (date < rule.effectiveFrom) continue;

        // The rule version or repeating series has ended
        if (rule.effectiveTo && date > rule.effectiveTo) continue;
        if (rule.endDate && date > rule.endDate) continue;

        // The task was deleted from this date onward
        if (task.deletedFrom && date >= task.deletedFrom) continue;

        // This occurrence was deleted with "This Task Only"
        const skipped = task.skips.some(
          (skip) => skip.date.getTime() === date.getTime(),
        );
        if (skipped) continue;

        // If repeating task
        if (rule.repeating) {
          // Get weekday of the current date
          const weekday = WEEKDAYS[date.getUTCDay()];
          // If not repeat on this weekday
          if (weekday === undefined || !rule.days.includes(weekday)) continue;
        } else {
          // A one-off task appears only on its effective date
          if (date.getTime() !== rule.effectiveFrom.getTime()) continue;
        }

        // Check whether the current task on this date has completion
        const completed = task.completions.some(
          (completion) => completion.date.getTime() === date.getTime(),
        );

        // Look for this card's override (undefined if there is none)
        const override = task.overrides.find(
          (taskOverride) => taskOverride.date.getTime() === date.getTime(),
        );

        // One occurrence
        // Only
        occurrences.push({
          taskId: task.id,
          ruleId: rule.id,
          date,
          text: override ? override.text : rule.text,
          completed,
          label: override ? override.label : rule.label,
          days: rule.days,
          repeating: rule.repeating,
          endDate: rule.endDate,
        });
      }
    }
  }

  return occurrences;
}
