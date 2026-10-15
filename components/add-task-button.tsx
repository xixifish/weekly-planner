"use client";
import { useRef } from "react";

import { AddIcon } from "./icons";
import { formatWeekRange } from "@/lib/dates/week";
import { TaskForm } from "./task-form";

type AddTaskButtonProps = {
  weekStart: Date;
};

export function AddTaskButton({ weekStart }: AddTaskButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      {/* Floating + at the bottom right */}
      <button
        type="button"
        aria-label="Add task"
        onClick={() => dialogRef.current?.showModal()}
        className="fixed right-10 bottom-15 flex size-18 items-center justify-center rounded-full bg-logo-blue text-white shadow-lg transition hover:bg-selected-blue hover:shadow"
      >
        <AddIcon className="size-10" />
      </button>

      {/* Add dialog */}
      <dialog
        ref={dialogRef}
        aria-labelledby="add-task-title"
        className="m-auto w-[699px] rounded-xl bg-white px-7.5 py-5 backdrop:bg-black/40"
      >
        <h2 id="add-task-title" className="text-lg text-text-dark">
          <span className="font-bold">Add Task</span> ·{" "}
          {formatWeekRange(weekStart)}
        </h2>

        <TaskForm onCancel={() => dialogRef.current?.close()} />
      </dialog>
    </>
  );
}
