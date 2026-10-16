"use client";
import { useRef, useState } from "react";

import { AddIcon } from "./icons";
import { TaskForm } from "./task-form";

type AddTaskButtonProps = {
  weekStart: Date;
};

export function AddTaskButton({ weekStart }: AddTaskButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

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
        className="m-auto w-[700px] rounded-xl bg-white px-7.5 py-5 backdrop:bg-black/40"
      >
        <TaskForm
          key={formKey}
          onCancel={() => dialogRef.current?.close()}
          onSaved={() => {
            dialogRef.current?.close();
            setFormKey((key) => key + 1);
          }}
          weekStart={weekStart}
        />
      </dialog>
    </>
  );
}
