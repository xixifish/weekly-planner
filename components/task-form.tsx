"use client";

import { useState } from "react";

import { CheckIcon } from "./icons";
import { Weekday } from "@/app/generated/prisma/enums";

const WEEKDAY_OPTIONS = [
  { value: Weekday.MON, label: "Mon" },
  { value: Weekday.TUE, label: "Tue" },
  { value: Weekday.WED, label: "Wed" },
  { value: Weekday.THU, label: "Thu" },
  { value: Weekday.FRI, label: "Fri" },
  { value: Weekday.SAT, label: "Sat" },
  { value: Weekday.SUN, label: "Sun" },
];

// A pill-shaped option: a hidden checkbox inside a styled label
const pillClass =
  "flex h-8.5 px-4 cursor-pointer items-center justify-center rounded-md border border-area-border-grey text-sm font-medium text-text-dark has-checked:border-logo-blue has-checked:bg-select-blue has-checked:text-logo-blue has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-logo-blue hover:border-logo-blue";

const sectionTitleClass =
  "mb-2 text-sm font-bold text-text-grey-blue uppercase";

type TaskFormProps = {
  onCancel: () => void;
};

export function TaskForm({ onCancel }: TaskFormProps) {
  return (
    <form className="mt-4">
      {/* Task fields */}
      <textarea
        name="description"
        placeholder="Describe your task"
        maxLength={1000}
        className="w-full h-25 rounded-md border px-2 py-1.5 text-lg font-semibold text-text-dark placeholder:text-text-grey-blue resize-none border-area-border-grey focus:border-logo-blue focus:outline-none"
        aria-label="Task description"
      />

      {/* DAYS: seven weekday checkboxes and the Repeating Task toggle */}
      <fieldset className="mt-4 border-b border-area-border-grey pb-4">
        <legend className={sectionTitleClass}>Days</legend>
        <div className="flex gap-2">
          {WEEKDAY_OPTIONS.map((day) => (
            <label key={day.value} className={pillClass}>
              <input
                type="checkbox"
                name="days"
                value={day.value}
                className="sr-only"
              />
              {day.label}
            </label>
          ))}
          <label className={`${pillClass} group gap-2`}>
            <input
              type="checkbox"
              name="repeating"
              value="true"
              className="sr-only"
            />
            <span className="flex size-5 items-center justify-center rounded-full border border-button-off-grey text-white group-has-checked:border-check-green group-has-checked:bg-check-green">
              <CheckIcon className="hidden size-4 group-has-checked:block" />
            </span>
            Repeating Task
          </label>
        </div>
      </fieldset>

      <button
        type="button"
        onClick={onCancel}
        className="mt-6 rounded-md border border-area-border-grey px-4 py-1.5 text-sm font-semibold text-text-dark"
      >
        Cancel
      </button>
    </form>
  );
}
