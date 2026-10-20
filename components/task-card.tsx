"use client";

import { toggleTaskCompletion } from "@/app/actions/completions";
import { toDateString } from "@/lib/dates/week";
import type { TaskOccurrence } from "@/lib/tasks/get-week-occurrences";
import { LABEL_OPTIONS } from "@/lib/tasks/labels";

import { useTaskDialog } from "./task-dialog-provider";

import { CheckIcon } from "./icons";

type TaskCardProps = {
  occurrence: TaskOccurrence;
};

export function TaskCard({ occurrence }: TaskCardProps) {
  const { taskId, date, text, completed, label } = occurrence;
  const { openEdit } = useTaskDialog();

  // The label's colour class, e.g. "bg-tag-green"; undefined when there is no label
  const labelClass = LABEL_OPTIONS.find(
    (option) => option.value === label,
  )?.className;

  return (
    <li
      className={`relative group flex h-11 w-55 cursor-pointer items-center overflow-hidden rounded-md border border-area-border-grey pr-3 transition ${labelClass ? "" : "pl-3"} ${completed ? "bg-background-grey" : "bg-white shadow-xs hover:border-selected-blue"}`}
    >
      {/* The label colour: a bar along the left edge */}
      {labelClass && (
        <span
          aria-hidden="true"
          className={`mr-3 w-1.5 shrink-0 self-stretch ${labelClass}`}
        />
      )}
      {/* Tick: always shown when done; otherwise on hover or keyboard focus */}
      <form
        action={toggleTaskCompletion}
        className={`relative z-10 flex shrink-0 overflow-hidden transition-[width] motion-reduce:transition-none ${
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
              : "border-dark-border-grey opacity-0 group-hover:opacity-100 hover:border-check-green focus-visible:opacity-100"
          }`}
        >
          {completed && <CheckIcon className="size-3.5" />}
        </button>
      </form>
      <button
        type="button"
        onClick={() => openEdit(occurrence)}
        title={text}
        className={`min-w-0 flex-1 truncate text-left text-[13px] font-medium after:absolute after:inset-0 ${completed ? "text-text-grey line-through" : "text-text-dark"}`}
      >
        {text}
      </button>
    </li>
  );
}
