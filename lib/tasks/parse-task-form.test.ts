import { describe, expect, it } from "vitest";

import { utc } from "@/test/utc";
import { parseTaskForm } from "./parse-task-form";

// A valid one-off task on Wednesday, Oct 21; each test changes one field
function oneOffForm() {
  const formData = new FormData();
  formData.set("description", " Run in the park ");
  formData.set("date", "2026-10-21");
  formData.append("days", "WED");
  return formData;
}

// A valid repeating task: Mondays and Wednesdays from Monday, Oct 19
function repeatingForm() {
  const formData = new FormData();
  formData.set("description", "Gym");
  formData.set("date", "2026-10-19");
  formData.append("days", "MON");
  formData.append("days", "WED");
  formData.set("repeating", "true");
  return formData;
}

describe("parseTaskForm", () => {
  it("returns the fields of a valid one-off task", () => {
    expect(parseTaskForm(oneOffForm())).toEqual({
      text: "Run in the park",
      days: ["WED"],
      repeating: false,
      date: utc("2026-10-21"),
      endDate: null,
      label: null,
    });
  });

  it("rejects a description of only spaces", () => {
    const formData = oneOffForm();
    formData.set("description", "   ");

    expect(() => parseTaskForm(formData)).toThrow("Enter a task description");
  });

  it("rejects a one-off date that isn't on the selected day", () => {
    const formData = oneOffForm();
    formData.set("days", "THU");

    expect(() => parseTaskForm(formData)).toThrow(
      "The date does not match the selected day",
    );
  });

  it("returns the fields of a repeating task with an end date and label", () => {
    const formData = repeatingForm();
    formData.set("endDate", "2026-11-30");
    formData.set("label", "ORANGE");

    expect(parseTaskForm(formData)).toEqual({
      text: "Gym",
      days: ["MON", "WED"],
      repeating: true,
      date: utc("2026-10-19"),
      endDate: utc("2026-11-30"),
      label: "ORANGE",
    });
  });

  it.each([
    {
      rule: "a one-off task with two days",
      start: oneOffForm,
      change: (formData: FormData) => formData.append("days", "FRI"),
      error: "A non-repeating task must have one day",
    },
    {
      rule: "an end date on a one-off task",
      start: oneOffForm,
      change: (formData: FormData) => formData.set("endDate", "2026-10-30"),
      error: "Only a repeating task can have an end date",
    },
    {
      rule: "an end date before the start",
      start: repeatingForm,
      change: (formData: FormData) => formData.set("endDate", "2026-10-18"),
      error: "End date cannot be before the start date",
    },
    {
      rule: "the same day twice",
      start: repeatingForm,
      change: (formData: FormData) => formData.append("days", "MON"),
      error: "Each day can only be selected once",
    },
    {
      rule: "an unknown label",
      start: oneOffForm,
      change: (formData: FormData) => formData.set("label", "BLACK"),
      error: "Invalid label",
    },
  ])("rejects $rule", ({ start, change, error }) => {
    const formData = start();
    change(formData);

    expect(() => parseTaskForm(formData)).toThrow(error);
  });
});
