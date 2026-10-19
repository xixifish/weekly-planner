import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { SignOutButton } from "./sign-out-button";

import { getWeekOccurrences } from "@/lib/tasks/get-week-occurrences";
import { getWeekDates } from "@/lib/dates/get-week-dates";

import { AppHeader } from "@/components/app-header";
import { WeekHeader } from "@/components/week-header";
import { parseWeekParam } from "@/lib/dates/week";
import { getToday, resolveTimeZone } from "@/lib/dates/today";
import { DayRow } from "@/components/day-row";
import { AddTaskButton } from "@/components/add-task-button";
import { TaskDialogProvider } from "@/components/task-dialog-provider";

export default async function Home({ searchParams }: PageProps<"/">) {
  const requestHeaders = await headers();
  // Read and validate the session takes time
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  // Which week to show: ?week=... from the URL, or the current week
  const today = getToday(
    resolveTimeZone(requestHeaders.get("x-vercel-ip-timezone")),
  );
  const { week } = await searchParams;
  // Get the start of the current week for the occurrences
  const weekStart = parseWeekParam(week, today);
  const occurrences = session ? await getWeekOccurrences(weekStart) : [];

  const weekDates = getWeekDates(weekStart);

  const doneCount = occurrences.filter(
    (occurrence) => occurrence.completed,
  ).length;

  if (!session) {
    return (
      <>
        <AppHeader />
        <WeekHeader weekStart={weekStart} doneCount={0} totalCount={0} />
        <main>
          {weekDates.map((date) => (
            <DayRow
              key={date.toISOString()}
              date={date}
              isToday={date.getTime() === today.getTime()}
              occurrences={[]}
            />
          ))}
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader user={session?.user} />
      <WeekHeader
        weekStart={weekStart}
        doneCount={doneCount}
        totalCount={occurrences.length}
      />
      <TaskDialogProvider weekStart={weekStart}>
        <main>
          {weekDates.map((date) => (
            <DayRow
              key={date.toISOString()}
              date={date}
              isToday={date.getTime() === today.getTime()}
              occurrences={occurrences.filter(
                (occurrence) => occurrence.date.getTime() === date.getTime(),
              )}
            />
          ))}
        </main>
        <AddTaskButton />
      </TaskDialogProvider>

      {/* Test-only: account info and sign out until the profile menu exists */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-5 py-4">
        <div>
          <p className="text-sm text-zinc-500">
            Signed in as {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>
    </>
  );
}
