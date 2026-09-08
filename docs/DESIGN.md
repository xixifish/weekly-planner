# Weekly Planner — Design

A planner for one week at a time. Seven day rows, one per day. Tasks are small cards you add, tick off, and repeat.

Initial design finished **23 August 2026**. Recurrence rules were revised **7 September 2026**.

Figma file: https://www.figma.com/design/PMOiVwojpmtcMso4lWKBma/weekly-planner

---

## 1. The week view

One week fills the screen. Seven day rows, stacked.

Each row has the day name and a "N/M done" count on the left, and the task cards to the right.

- Cards are 220px wide, in a row that wraps. Five fit at 1440px, four at 1200, three at 1024.
- A row grows taller when its cards wrap: 100px by default, plus 61px for each extra line.
- Today's row has an orange left edge, a pale yellow background, and an orange day name.
- A weekly progress bar sits top right, with a done/total count.
- Minimum width is 1024px. Below that is phone territory, which v1 does not cover.

**Old undone tasks stay in their past week.** Nothing rolls forward. This works like a paper planner — last week stays last week.

---

## 2. What a task is

A task has text, selected days, a repeating flag, an optional end date, and an optional label colour.

**Text and a day are required.** A non-repeating task has one day. A repeating task may have one or more weekdays.

**Text.** One line on the card, cut off with "…" when it is too long. Hovering the card shows the full text. The edit box shows all of it.

**Days.** These define when the task appears. A repeating task can occur several times in the current week, future weeks, or both.

**End date.** Available only for a repeating task. It is optional and inclusive. Without one, the task repeats indefinitely.

**Label.** Colour only in v1, no names. Six colours, or none.

---

## 3. Repeats

Turning on **Repeating Task** makes the selected weekdays a repeating pattern starting from the task date. Dates before the start are never created. The optional end date is the last date on which an occurrence may appear.

Occurrences are worked out when a week is opened rather than stored in advance. Changes to a single occurrence are stored separately from the repeating rule.

**The unit is the card, not the week.** A card is one task occurrence on one date.

**Ticking is per card.** Ticking Wednesday does not tick Friday in the same week, and week 20 does not tick week 21.

---

## 4. Editing and deleting

A non-repeating task uses direct **Save** and **Delete** actions. For a repeating task, each action opens a menu with **This Task Only** and **This and Future Tasks**.

**This Task Only** changes or deletes only the selected card. The repeating pattern remains unchanged.

**This and Future Tasks** includes later occurrences in the same week and in later weeks. Earlier occurrences remain unchanged. Saving splits the repeating rule at the selected card; deleting stops it there.

Save scope depends on the fields changed:

| Field | This Task Only | This and Future Tasks |
|---|---:|---:|
| Description or label | Yes | Yes |
| Days | No | Yes |
| Repeating Task | No | Yes |
| End Date | No | Yes |

If a schedule field changes, **This Task Only** is disabled with the message: "Schedule changes apply to this and future tasks." Editing controls remain scoped to the original repeating task even if repeating is turned off in the form.

Task deletion has no confirmation box. An Undo bar appears for about five seconds in the day where deletion began. Its message identifies the scope. Counts and progress update immediately and revert on Undo.

**Deleting your account is the exception. It does get a real confirm**, because it cannot be undone.

---

## 5. The card

States: plain, done, hover.

**The coloured left bar is the label the user picked.** It never changes to show state. A done task keeps its own colour.

- **Done**: green filled tick, greyed text. The left bar stays the label colour.
- **Hover**: the tick button appears straight away. Its space is reserved in the resting card, so the text does not shift when you hover.
- **Hover, after about 400ms**: the full text appears above the card, but only when the text is actually cut off. The delay stops it flashing as the mouse crosses a row. It is at most 280px wide, ignores the mouse, and flips sides near the edge of the window.

The end date controls recurrence only. It is not a deadline and does not create an overdue card state.

---

## 6. Adding and editing a task

The dialog title shows the action and the date, such as **Add Task · Tuesday, 12 May**. Opening it from a day preselects that day.

The dialog contains the task text, **Days**, a **Repeating Task** option, an optional label colour, and—when repeating is on—an optional **End Date**.

- A task that is not repeating has exactly one selected day.
- A repeating task may have one or more weekdays. Its occurrences can be within the current week, later weeks, or both.
- Turning repeating on keeps the selected day and allows more days. To turn it off, the user must first leave only one day selected. If they try sooner, the option stays on and the dialog asks them to choose one day. Turning it off automatically removes the end date.
- No end date means the task repeats indefinitely. An end date is inclusive and cannot be before the task starts. Removing it returns the task to indefinite repetition.
- Text and a day are required; label and end date are optional. Save stays disabled until the required fields are valid.
- The text box scrolls for long text. Titles contain no line breaks, spaces alone are invalid, and text is limited to 1000 characters.

Creating a task and editing a non-repeating task use a direct **Save** action. When editing a repeating task, **Save** and **Delete** each open a menu with two scopes: **This Task Only** and **This and Future Tasks**.

---

## 7. Accounts

**Sign in with social accounts only.** No email and password.

**The profile dropdown has four things**: name, email, Log out, Delete my account.

Four, not one, because social sign-in means you need to see *which* account you are in, and because storing someone's data means giving them a way to remove it. The avatar itself must never log you out — the dropdown is the safety.

**There is no settings page.** Those four items make one unnecessary.

**A new user sees the empty week** after signing in, the same as before signing in. No onboarding, no sample data.

---

## 8. Cut from v1, and why

| Cut | Why |
|---|---|
| Phone layout | Below 1024px is a different design, not a smaller one. v1 is desktop. |
| Drag a card to another day | Drag moves one occurrence, while the day picker changes the repeating pattern. They are different actions. |
| Move one card to another day | "Working late this Monday, so gym moves to Tuesday." For now: delete that card, then add a non-repeating task on Tuesday. |
| Label names | Colours are enough to group things. Labels are stored as named values, so names can be added later in code. |
| Carry unfinished tasks forward | A paper planner does not do it, and it hides the fact you did not do the thing. |
| Settings page | The four dropdown items cover everything a settings page would hold. |
| Clickable Figma prototype | A prototype exists to show an idea to someone before it is built. I am both the designer and the builder, and the live app is the demo. |

---
