import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import {
  deleteThisAndFutureTasks,
  saveThisAndFutureTasks,
} from "./actions/tasks";
import { deleteThisTaskOnly } from "./actions/skips";
import { saveThisTaskOnly } from "./actions/overrides";

import { SignOutButton } from "./sign-out-button";

import { Weekday } from "./generated/prisma/enums";
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

  const weekdayOptions = [
    { value: Weekday.MON, label: "Mon" },
    { value: Weekday.TUE, label: "Tue" },
    { value: Weekday.WED, label: "Wed" },
    { value: Weekday.THU, label: "Thu" },
    { value: Weekday.FRI, label: "Fri" },
    { value: Weekday.SAT, label: "Sat" },
    { value: Weekday.SUN, label: "Sun" },
  ];

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
      {/* Test-only: forms until the card and dialogs exist */}
      <div className="min-h-screen bg-zinc-100 px-6 py-8 text-zinc-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="grid items-start gap-6">
            {/* Right: the week's occurrences, one block per day */}
            <section className="flex flex-col gap-3">
              {weekDates.map((date) => {
                const dayOccurrences = occurrences.filter(
                  (occurrence) => occurrence.date.getTime() === date.getTime(),
                );
                const dayDoneCount = dayOccurrences.filter(
                  (occurrence) => occurrence.completed,
                ).length;

                return (
                  <div
                    key={date.toISOString()}
                    className="rounded-lg border border-zinc-200 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2">
                      <h3 className="font-semibold">
                        {date.toLocaleDateString("en-AU", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </h3>
                      <span className="text-sm text-zinc-500">
                        {dayDoneCount}/{dayOccurrences.length} done
                      </span>
                    </div>

                    {dayOccurrences.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-zinc-400">
                        No tasks
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2 p-3">
                        {dayOccurrences.map((occurrence) => (
                          <li
                            key={`${occurrence.ruleId}-${occurrence.date.toISOString()}`}
                            className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 px-3 py-2"
                          >
                            {/* Task information */}
                            <div className="min-w-0">
                              <p
                                className={
                                  occurrence.completed
                                    ? "text-zinc-400 line-through"
                                    : "font-medium"
                                }
                              >
                                {occurrence.text}
                              </p>
                              <p className="font-mono text-xs text-zinc-400">
                                task {occurrence.taskId}
                              </p>
                              {/* Temporary: test Save This Task Only */}
                              <details className="mt-1">
                                <summary className="cursor-pointer text-sm text-zinc-500">
                                  Edit This Task
                                </summary>
                                <form
                                  action={saveThisTaskOnly}
                                  className="mt-2 flex gap-2"
                                >
                                  <input
                                    type="hidden"
                                    name="taskId"
                                    value={occurrence.taskId}
                                  />
                                  <input
                                    type="hidden"
                                    name="date"
                                    value={occurrence.date
                                      .toISOString()
                                      .slice(0, 10)}
                                  />
                                  <input
                                    name="description"
                                    defaultValue={occurrence.text}
                                    required
                                    maxLength={1000}
                                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                                  />
                                  <button
                                    type="submit"
                                    className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
                                  >
                                    Save This Task
                                  </button>
                                </form>
                              </details>
                              {/* Temporary: test Save This and Future Tasks */}
                              <details className="mt-1">
                                <summary className="cursor-pointer text-sm text-zinc-500">
                                  Edit This and Future Tasks
                                </summary>
                                <form
                                  action={saveThisAndFutureTasks}
                                  className="mt-2 flex flex-col gap-2"
                                >
                                  <input
                                    type="hidden"
                                    name="taskId"
                                    value={occurrence.taskId}
                                  />
                                  <input
                                    type="hidden"
                                    name="date"
                                    value={occurrence.date
                                      .toISOString()
                                      .slice(0, 10)}
                                  />

                                  <input
                                    name="description"
                                    defaultValue={occurrence.text}
                                    required
                                    maxLength={1000}
                                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                                  />

                                  <div className="flex flex-wrap gap-1">
                                    {weekdayOptions.map((day) => (
                                      <label
                                        key={day.value}
                                        className="flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-0.5 text-xs has-checked:border-blue-600 has-checked:bg-blue-50"
                                      >
                                        <input
                                          type="checkbox"
                                          name="days"
                                          value={day.value}
                                        />
                                        {day.label}
                                      </label>
                                    ))}
                                  </div>

                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      name="repeating"
                                      value="true"
                                      defaultChecked
                                    />
                                    Repeating task
                                  </label>

                                  <label className="flex items-center gap-2 text-sm">
                                    End date
                                    <input
                                      name="endDate"
                                      type="date"
                                      className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                                    />
                                  </label>

                                  <button
                                    type="submit"
                                    className="self-start rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
                                  >
                                    Save This and Future Tasks
                                  </button>
                                </form>
                              </details>
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 items-center gap-2">
                              <form action={deleteThisTaskOnly}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={occurrence.taskId}
                                />
                                <input
                                  type="hidden"
                                  name="date"
                                  value={occurrence.date
                                    .toISOString()
                                    .slice(0, 10)}
                                />
                                <button
                                  type="submit"
                                  className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
                                >
                                  Delete
                                </button>
                              </form>
                              <form action={deleteThisAndFutureTasks}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={occurrence.taskId}
                                />
                                <input
                                  type="hidden"
                                  name="date"
                                  value={occurrence.date
                                    .toISOString()
                                    .slice(0, 10)}
                                />
                                <button
                                  type="submit"
                                  className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
                                >
                                  Delete All After
                                </button>
                              </form>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
