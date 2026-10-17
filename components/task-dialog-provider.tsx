"use client";

import { createContext, useContext, useRef, useState } from "react";

import { TaskForm } from "./task-form";

// What other components can ask the dialog to do
type TaskDialogContextValue = {
  openAdd: () => void;
};

const TaskDialogContext = createContext<TaskDialogContextValue | null>(null);

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

  function openAdd() {
    dialogRef.current?.showModal();
  }

  return (
    <TaskDialogContext value={{ openAdd }}>
      {children}

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
    </TaskDialogContext>
  );
}
