// The user's time zone: from Vercel's request header when deployed
// otherwise the server's own time zone
export function resolveTimeZone(headerValue: string | null) {
  if (headerValue && Intl.supportedValuesOf("timeZone").includes(headerValue)) {
    return headerValue;
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Today's date in that time zone, as UTC midnight like every other date in the app
export function getToday(timeZone: string) {
  const dateString = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${dateString}T00:00:00.000Z`);
}
