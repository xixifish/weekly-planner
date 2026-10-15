"use client";

import { toggleTaskCompletion } from "@/app/actions/completions";
import { toDateString } from "@/lib/dates/week";
import type { TaskOccurrence } from "@/lib/tasks/get-week-occurrences";

import { CheckIcon } from "./icons";
type TaskCardProps = {
  occurrence: TaskOccurrence;
};

export function TaskCard({ occurrence }: TaskCardProps) {
  const { taskId, date, text, completed } = occurrence;

  return (
    <li
      className={`group flex h-11 w-55 cursor-pointer items-center rounded-md border border-area-border-grey bg-white px-3 transition-shadow ${completed ? "" : "shadow-sm hover:shadow-none"}`}
    >
      {/* Tick: always shown when done; otherwise on hover or keyboard focus */}
      <form
        action={toggleTaskCompletion}
        className={`flex shrink-0 overflow-hidden transition-[width] motion-reduce:transition-none ${
          completed
            ? "w-7.5"
            : "w-0 group-has-focus-visible:w-7.5 group-hover:w-7.5"
        }`}
      >
        <input type="hidden" name="taskId" value={taskId} />
        <input type="hidden" name="date" value={toDateString(date)} />
        <button
          type="submit"
          aria-label={
            completed ? `Mark "${text}" as not done` : `Mark "${text}" as done`
          }
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition ${
            completed
              ? "border-check-green bg-check-green text-white"
              : "border-button-off-grey opacity-0 group-hover:opacity-100 hover:border-check-green focus-visible:opacity-100"
          }`}
        >
          {completed && <CheckIcon className="size-3.5" />}
        </button>
      </form>
      <p
        title={text}
        className={`min-w-0 truncate text-[13px] font-medium ${completed ? "text-text-grey line-through" : "text-text-dark"}`}
      >
        {text}
      </p>
    </li>
  );
}
