import { Weekday } from "@/app/generated/prisma/enums";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// getUTCDay() numbers the days from Sunday (0) to Saturday (6)
export const WEEKDAYS = [
  Weekday.SUN,
  Weekday.MON,
  Weekday.TUE,
  Weekday.WED,
  Weekday.THU,
  Weekday.FRI,
  Weekday.SAT,
];

// The weekday of a UTC-midnight date, e.g. Weekday.WED
export function getWeekday(date: Date) {
  return WEEKDAYS[date.getUTCDay()];
}

// A UTC-midnight date as "2026-10-12"
export function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// The Monday of the week that contains `date`
export function getWeekStart(date: Date) {
  const daySinceMonday = (date.getUTCDay() + 6) % 7;
  return addDays(date, -daySinceMonday);
}

// ISO week number: weeks start on Monday, and week 1 contains 4 January (ISO rule)
export function getIsoWeek(date: Date) {
  const weekStart = getWeekStart(date);
  // A week belongs to the year its Thursday falls in
  const year = addDays(weekStart, 3).getUTCFullYear();
  const firstWeekStart = getWeekStart(new Date(Date.UTC(year, 0, 4)));
  const week =
    Math.round(
      (weekStart.getTime() - firstWeekStart.getTime()) / (7 * DAY_IN_MS),
    ) + 1;

  return { week, year };
}

// 52 or 53: 28 December is always in the last week of its year
export function getWeeksInYear(year: number) {
  return getIsoWeek(new Date(Date.UTC(year, 11, 28))).week;
}

// Reads ?week=YYYY-MM-DD; falls back to the week that contains today
export function parseWeekParam(
  value: string | string[] | undefined,
  today: Date,
) {
  if (typeof value === "string") {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (!Number.isNaN(date.getTime()) && toDateString(date) === value) {
      return getWeekStart(date);
    }
  }

  return getWeekStart(today);
}

// A week's dates, e.g. "Aug 31 - Sep 6"; used by the week header and the add dialog
export function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

  const start = formatShortDate(weekStart);
  const end =
    month(weekStart) === month(weekEnd)
      ? `${weekEnd.getUTCDate()}`
      : `${month(weekEnd)} ${weekEnd.getUTCDate()}`;

  return `${start} - ${end}`;
}

// A "YYYY-MM-DD" date as "Oct 30, 2026"
export function formatLongDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// A date as "Oct 14", for showing single date title on edit dialog
export function formatShortDate(date: Date) {
  const month = date.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${month} ${date.getUTCDate()}`;
}
