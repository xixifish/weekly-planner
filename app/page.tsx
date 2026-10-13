import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { createTask } from "./actions/tasks";
import { toggleTaskCompletion } from "./actions/completions";
import { deleteThisTaskOnly } from "./actions/skips";

import { SignInButton } from "@/app/sign-in-button";
import { SignOutButton } from "./sign-out-button";

import { Weekday } from "./generated/prisma/enums";
import { getWeekOccurrences } from "@/lib/tasks/get-week-occurrences";
import { getWeekDates } from "@/lib/dates/get-week-dates";

const fieldClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900";

export default async function Home() {
  // Read and validate the session takes time
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get the start of the current week for the occurrences
  const weekStart = new Date("2026-09-28T00:00:00.000Z");
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
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-100 px-6 text-zinc-900">
        <h1 className="text-3xl font-semibold">Weekly Planner</h1>
        <SignInButton />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-8 text-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Header: title, account, sign out */}
        <header className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-5 py-4">
          <div>
            <h1 className="text-2xl font-semibold">Weekly Planner</h1>
            <p className="text-sm text-zinc-500">
              Signed in as {session.user.email}
            </p>
          </div>
          <SignOutButton />
        </header>

        <div className="grid items-start gap-6 md:grid-cols-[320px_1fr]">
          {/* Left: create task form */}
          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">Create a task</h2>
            <form action={createTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  required
                  maxLength={1000}
                  className={fieldClass}
                />
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-medium">Days</legend>
                <div className="flex flex-wrap gap-2">
                  {weekdayOptions.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-sm has-checked:border-blue-600 has-checked:bg-blue-50"
                    >
                      <input type="checkbox" name="days" value={day.value} />
                      {day.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="repeating" value="true" />
                Repeating task
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="date" className="text-sm font-medium">
                    Start date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className={fieldClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Create task
              </button>
            </form>
          </section>

          {/* Right: the week's occurrences, one block per day */}
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">
                Week of{" "}
                {weekStart.toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </h2>
              <p className="text-sm text-zinc-500">
                {doneCount}/{occurrences.length} done
              </p>
            </div>

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
                    <p className="px-4 py-3 text-sm text-zinc-400">No tasks</p>
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
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-2">
                            <form action={toggleTaskCompletion}>
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
                                className={
                                  occurrence.completed
                                    ? "rounded-md bg-green-600 px-3 py-1 text-sm text-white"
                                    : "rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50"
                                }
                              >
                                {occurrence.completed ? "✓ Done" : "Mark done"}
                              </button>
                            </form>
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
    </main>
  );
}
