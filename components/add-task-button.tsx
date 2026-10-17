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
        className="fixed right-10 bottom-15 flex size-18 items-center justify-center rounded-full bg-logo-blue text-white shadow-lg transition hover:bg-selected-blue hover:shadow"
      >
        <AddIcon className="size-10" />
      </button>
    </>
  );
}
