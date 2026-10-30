"use client";

import { AddIcon } from "./icons";
import { useTaskDialog } from "./task-dialog-provider";

export function AddTaskButton() {
  const { openAdd } = useTaskDialog();

  return (
    <>
      {/* Floating + at the bottom right */}
      <button
        type="button"
        aria-label="Add task"
        onClick={() => {
          openAdd();
        }}
        className="fixed right-4 bottom-6 flex size-14 items-center justify-center rounded-full bg-logo-blue text-white shadow-lg transition hover:bg-selected-blue hover:shadow md:right-10 md:bottom-15 md:size-18"
      >
        <AddIcon className="size-8 md:size-10" />
      </button>
    </>
  );
}
