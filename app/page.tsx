import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { createTask } from "./actions/tasks";

import { SignInButton } from "@/app/sign-in-button";
import { SignOutButton } from "./sign-out-button";

import { Weekday } from "./generated/prisma/enums";
import { getWeekOccurrences } from "@/lib/tasks/get-week-occurrences";

// `async` because reading and validating the session takes time
export default async function Home() {
  const weekStart = new Date("2026-09-14T00:00:00.000Z");
  const occurrences = await getWeekOccurrences(weekStart);

  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + index);
    return date;
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const tasks = session
    ? await prisma.task.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          rules: {
            orderBy: {
              effectiveFrom: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  const weekdayOptions = [
    { value: Weekday.MON, label: "Mon" },
    { value: Weekday.TUE, label: "Tue" },
    { value: Weekday.WED, label: "Wed" },
    { value: Weekday.THU, label: "Thu" },
    { value: Weekday.FRI, label: "Fri" },
    { value: Weekday.SAT, label: "Sat" },
    { value: Weekday.SUN, label: "Sun" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6">
      <h1 className="text-3xl font-semibold text-zinc-900">Weekly Planner</h1>
      {session ? (
        <div>
          <p className="text-zinc-900">Signed in as {session.user.email}</p>
          <SignOutButton />
          <form action={createTask} className="flex flex-col gap-3">
            <input
              id="description"
              name="description"
              type="text"
              required
              maxLength={1000}
              className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
            />
            {weekdayOptions.map((day) => (
              <label key={day.value}>
                <input type="checkbox" name="days" value={day.value} />
                {day.label}
              </label>
            ))}
            <label>
              <input type="checkbox" name="repeating" value="true" />
              Repeating task
            </label>
            <label htmlFor="date">Start Date</label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
            />
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white"
            >
              Create task
            </button>
          </form>
          <div>
            {tasks.length > 0 ? (
              <ul>
                {tasks.map((task) => (
                  <li key={task.id} className="text-zinc-900">
                    {task.rules[0]?.text ?? "The task unexpectedly has no text"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-900">No tasks yet.</p>
            )}
          </div>
          <br />
          {weekDates.map((date) => {
            const dayOccurrences = occurrences.filter(
              (occurrence) => occurrence.date.getTime() === date.getTime(),
            );
            return (
              <section key={date.toISOString()}>
                <h2>
                  {date.toLocaleDateString("en-AU", {
                    weekday: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </h2>
                {dayOccurrences.map((occurrence) => (
                  <p
                    key={`${occurrence.ruleId}-${occurrence.date.toISOString()}`}
                  >
                    {occurrence.text}
                  </p>
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        <SignInButton />
      )}
    </main>
  );
}
