import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { createTask } from "./actions/tasks";

import { SignInButton } from "@/app/sign-in-button";
import { SignOutButton } from "./sign-out-button";

export default async function Home() {
  // `async` because reading and validating the session takes time

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
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              required
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
        </div>
      ) : (
        <SignInButton />
      )}
    </main>
  );
}
