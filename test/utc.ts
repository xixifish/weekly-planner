// A "YYYY-MM-DD" date at UTC midnight, like every date in the app
export function utc(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
