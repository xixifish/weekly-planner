import { Weekday, LabelColour } from "@/app/generated/prisma/enums";
import { getWeekday } from "../dates/week";

export function parseTaskForm(formData: FormData) {
  const description = formData.get("description");
  const dateValue = formData.get("date");
  const rawSelectedDays = formData.getAll("days");
  const repeatingValue = formData.get("repeating") === "true";
  // A one-off task's form has no end date field at all
  const endDateValue = formData.get("endDate") ?? "";
  // Color label
  const labelValue = formData.get("label");
  const colourLabels = Object.values(LabelColour);

  // 1. Validate: description cannot be empty
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Enter a task description");
  }
  // Description cannot be longer than 1000 characters
  if (description.trim().length > 1000) {
    throw new Error("Task description is too long");
  }

  // 2. Validate: date
  if (typeof dateValue !== "string" || !dateValue) {
    throw new Error("Choose a date");
  }
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateValue
  ) {
    throw new Error("Choose a valid date");
  }

  // 3. Validate: selected days
  const selectedDays = rawSelectedDays as Weekday[];
  if (selectedDays.length === 0) {
    throw new Error("Choose a day");
  }
  const validWeekdays = Object.values(Weekday);
  if (
    rawSelectedDays.some(
      (day) =>
        typeof day !== "string" || !validWeekdays.includes(day as Weekday),
    )
  ) {
    throw new Error("Invalid day");
  }
  // Reject duplicated weekdays in the submitted FormData
  if (new Set(selectedDays).size !== selectedDays.length) {
    throw new Error("Each day can only be selected once");
  }

  // 4. Validate: endDate
  if (typeof endDateValue !== "string") {
    throw new Error("Invalid end date");
  }

  let endDate: Date | null = null;

  if (endDateValue) {
    if (!repeatingValue) {
      throw new Error("Only a repeating task can have an end date");
    }

    endDate = new Date(`${endDateValue}T00:00:00.000Z`);

    if (
      Number.isNaN(endDate.getTime()) ||
      endDate.toISOString().slice(0, 10) !== endDateValue
    ) {
      throw new Error("Choose a valid end date");
    }

    if (endDate < date) {
      throw new Error("End date cannot be before the start date");
    }
  }

  // 5. Validate: only repeating task can have multiple selected days
  if (!repeatingValue && selectedDays.length !== 1) {
    throw new Error("A non-repeating task must have one day");
  }

  // 6. Validate: one-off task
  if (!repeatingValue && getWeekday(date) !== selectedDays[0]) {
    throw new Error("The date does not match the selected day");
  }

  // 7. Validate: color label ("" or missing means no label)
  let label: LabelColour | null = null;
  if (labelValue !== null && labelValue !== "") {
    if (
      typeof labelValue !== "string" ||
      !colourLabels.includes(labelValue as LabelColour)
    ) {
      throw new Error("Invalid label");
    }
    label = labelValue as LabelColour;
  }

  return {
    text: description.trim(),
    days: selectedDays,
    repeating: repeatingValue,
    date,
    endDate,
    label,
  };
}
