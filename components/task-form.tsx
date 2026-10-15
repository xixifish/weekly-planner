"use client";

import { useState } from "react";

import { CheckIcon, CrossIcon } from "./icons";
import { Weekday } from "@/app/generated/prisma/enums";
import { LABEL_OPTIONS } from "@/lib/tasks/labels";

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
  "flex h-8.5 px-4 cursor-pointer items-center justify-center rounded-md border border-area-border-grey text-sm font-medium text-text-dark has-checked:border-logo-blue has-checked:bg-select-blue has-checked:text-logo-blue has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-logo-blue hover:border-logo-blue transition";

const sectionTitleClass =
  "mb-3 text-sm font-bold text-text-grey-blue uppercase";

// A round label option: a hidden radio inside a styled label
const swatchClass =
  "group flex size-8 cursor-pointer items-center justify-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-logo-blue";

// Colour circles: a grey border, blue when selected
const colourSwatchClass = `${swatchClass} border-2 border-area-border-grey has-checked:border-logo-blue`;

// Footer buttons (Cancel, Save); each adds its own colours
const buttonClass = "h-9.5 rounded-md px-4 text-base font-bold transition";

type TaskFormProps = {
  onCancel: () => void;
};

export function TaskForm({ onCancel }: TaskFormProps) {
  const [text, setText] = useState("");
  const [days, setDays] = useState<Weekday[]>([]);
  const [repeating, setRepeating] = useState(false);
  // The user tries to turn Repeating off while several days were selected
  const [turnOffBlocked, setTurnOffBlocked] = useState(false);

  // If the day is already selected, remove it; otherwise add it
  function toggleDay(day: Weekday) {
    const nextDays = days.includes(day)
      ? days.filter((selected) => selected !== day)
      : [...days, day];

    setDays(nextDays);
    // Down to one day: the turn-off problem is solved
    if (nextDays.length <= 1) {
      setTurnOffBlocked(false);
    }
  }

  // Repeating can only be turned off when at most one day is selected
  function changeRepeating(checked: boolean) {
    if (!checked && days.length > 1) {
      setTurnOffBlocked(true);
      return;
    }

    setRepeating(checked);
    setTurnOffBlocked(false);
  }

  // A one-off task has exactly one day
  const tooManyDays = !repeating && days.length > 1;

  const daysError = tooManyDays
    ? "Turn on Repeating Task to choose more than one day"
    : turnOffBlocked
      ? "Choose one day only before turning off repeating"
      : null;

  return (
    <form className="mt-4">
      {/* Task fields */}
      <textarea
        name="description"
        placeholder="Describe your task"
        maxLength={1000}
        className="w-full h-25 rounded-md border px-2 py-1.5 text-lg font-semibold text-text-dark placeholder:text-text-grey-blue resize-none border-area-border-grey focus:border-logo-blue focus:outline-none"
        aria-label="Task description"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />

      {/* DAYS: seven weekday checkboxes and the Repeating Task toggle */}
      <fieldset className="relative mt-4 border-b border-area-border-grey pb-4">
        <legend
          className={`${sectionTitleClass} flex w-full items-baseline justify-between`}
        >
          <span>Days</span>
          {daysError && (
            <span
              role="alert"
              className="text-[13px] font-medium text-error-red normal-case"
            >
              {daysError}
            </span>
          )}
        </legend>
        <div className="flex gap-2">
          {WEEKDAY_OPTIONS.map((day) => (
            <label key={day.value} className={`${pillClass} flex-1`}>
              <input
                type="checkbox"
                name="days"
                value={day.value}
                checked={days.includes(day.value)}
                onChange={() => toggleDay(day.value)}
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
              checked={repeating}
              onChange={(event) => changeRepeating(event.target.checked)}
            />
            <span className="flex size-5 items-center justify-center rounded-full border border-button-off-grey text-white group-has-checked:border-check-green group-has-checked:bg-check-green">
              <CheckIcon className="hidden size-4 group-has-checked:block" />
            </span>
            Repeating Task
          </label>
        </div>
      </fieldset>

      {/* ENDS: only for a repeating task; the end date comes in 3b.3 */}
      {repeating && (
        <fieldset className="mt-4 border-b border-area-border-grey pb-4">
          <legend className={sectionTitleClass}>Ends</legend>
          <p className="text-[13px] text-text-grey-blue">
            Optional: Leave blank to repeat indefinitely
          </p>
        </fieldset>
      )}

      {/* LABEL: one colour, or none */}
      <fieldset className="mt-4 border-b border-area-border-grey pb-4">
        <legend className={sectionTitleClass}>Label</legend>
        <div className="flex gap-3">
          {LABEL_OPTIONS.map((option) => (
            <label
              key={option.value}
              title={option.label}
              className={`${colourSwatchClass} ${option.className}`}
            >
              <input
                type="radio"
                name="label"
                value={option.value}
                aria-label={option.label}
                className="sr-only"
              />
              <CheckIcon className="hidden size-4.5 text-logo-blue group-has-checked:block" />
            </label>
          ))}

          {/* No label: selected by default */}
          <label
            title="No label"
            className={`${colourSwatchClass} text-button-off-grey has-checked:text-logo-blue`}
          >
            <input
              type="radio"
              name="label"
              value=""
              defaultChecked
              aria-label="No label"
              className="sr-only"
            />
            <CrossIcon className="size-4.5" />
          </label>
        </div>
      </fieldset>

      {/* Footer */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={`${buttonClass} border border-logo-blue text-logo-blue hover:border-selected-blue hover:text-selected-blue`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${buttonClass} bg-logo-blue text-white hover:bg-selected-blue`}
        >
          Save
        </button>
      </div>
    </form>
  );
}
