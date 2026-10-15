"use client";
import { useRef } from "react";

import { AddIcon } from "./icons";

export function AddTaskButton() {
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
        className="m-auto w-[480px] rounded-xl bg-white p-8 backdrop:bg-black/40"
      >
        <h2
          id="add-task-title"
          className="text-xl font-extrabold text-text-dark"
        >
          Add Task
        </h2>

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="mt-6 rounded-[5px] border border-area-border-grey px-4 py-1.5 text-sm font-semibold text-text-dark"
        >
          Cancel
        </button>
      </dialog>
    </>
  );
}
