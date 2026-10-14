const DAY_IN_MS = 24 * 60 * 60 * 1000;

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
