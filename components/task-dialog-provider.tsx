"use client";

import { createContext, useContext, useRef, useState } from "react";

import { TaskForm } from "./task-form";
import type { TaskOccurrence } from "@/lib/tasks/build-occurrences";

// What other components can ask the dialog to do
type TaskDialogContextValue = {
  openAdd: () => void;
  openEdit: (occurrence: TaskOccurrence) => void;
};

const TaskDialogContext = createContext<TaskDialogContextValue | null>(null);

// Phones: the sheet slides up from the bottom and the page behind fades darker when it opens,
// and both reverse when it closes (closing animates in Chrome only). Desktop and "Reduce motion": no animation
const sheetAnimationClass =
  "translate-y-full open:translate-y-0 starting:open:translate-y-full transition-[translate,display,overlay] transition-discrete duration-200 ease-out md:transition-none motion-reduce:transition-none backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-200 md:backdrop:transition-none motion-reduce:backdrop:transition-none";

// Lets a component inside TaskDialogProvider open the dialog
export function useTaskDialog() {
  const value = useContext(TaskDialogContext);
  if (value === null) {
    throw new Error("useTaskDialog must be used inside TaskDialogProvider");
  }
  return value;
}

type TaskDialogProviderProps = {
  weekStart: Date;
  children: React.ReactNode;
};

export function TaskDialogProvider({
  weekStart,
  children,
}: TaskDialogProviderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // A new key gives the next opening a fresh, empty form
  const [formKey, setFormKey] = useState(0);
  // The card being edited; null means the dialog is adding a new task
  const [editing, setEditing] = useState<TaskOccurrence | null>(null);

  function openAdd() {
    setEditing(null);
    dialogRef.current?.showModal();
  }

  function openEdit(occurrence: TaskOccurrence) {
    setEditing(occurrence);
    dialogRef.current?.showModal();
  }

  return (
    <TaskDialogContext value={{ openAdd, openEdit }}>
      {children}

      {/* The one task dialog: adding or editing */}
      <dialog
        ref={dialogRef}
        aria-labelledby="task-dialog-title"
        className={`mx-0 mt-auto mb-0 w-full max-w-none rounded-t-xl bg-surface px-4 pt-4 md:px-7.5 md:py-5 backdrop:bg-backdrop overflow-visible md:m-auto md:w-[700px] md:rounded-xl open:flex open:flex-col ${sheetAnimationClass}`}
      >
        <TaskForm
          key={
            editing
              ? `edit-${editing.taskId}-${editing.date.toISOString()}`
              : `add-${formKey}`
          }
          occurrence={editing}
          onCancel={() => dialogRef.current?.close()}
          onSaved={() => {
            dialogRef.current?.close();
            setFormKey((key) => key + 1);
          }}
          onDeleted={() => {
            dialogRef.current?.close();
          }}
          weekStart={weekStart}
        />
      </dialog>
    </TaskDialogContext>
  );
}
