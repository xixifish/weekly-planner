# Weekly Planner — Design

A planner for one week at a time. Seven day rows, one per day. Tasks are small cards you add, tick off, and repeat.

Initial design finished **23 August 2026**. Recurrence rules were revised **6 September 2026**.

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

A task has text, one or more days, a repeat flag, a due date, and an optional label colour.

**Text and at least one day are required.** Repeat and label are optional. A due date is optional for a one-off task and required for a repeating task.

**Text.** One line on the card, cut off with "…" when it is too long. Hovering the card shows the full text. The edit box shows all of it.

**Days.** Pick at least one day of the week. A task with no day has nowhere to appear, so none is not a valid state — the database enforces it too. "Daily" is only a shortcut for picking all seven — it lights up if you pick all seven by hand.

**Due date.** For a repeating task, this is also the last date on which it can appear. The date is inclusive. A stopwatch appears on the card and turns red once the due date has passed.

**Label.** Colour only in v1, no names. Six colours, or none.

---

## 3. Repeats

This is the part most planners skip, and the part worth getting right.

Ticking "repeat weekly until due date" on a task created in week 20 with Wed and Fri means: the task shows on Wed and Fri of week 20, and on those days in each following week **up to its due date.** A repeating task cannot be saved without a due date.

Repeated tasks are bounded, but their cards are still worked out when a week is opened rather than stored in advance. So:

- **One row per task rule** — text, days, start date, repeat flag, due date, optional earlier end date, label.
- **The week's cards are worked out when you open the week**, from those rules.
- **A separate skips table** holds the single cards the user has removed.
- **A one-off task is the same rule with repeat off.** One table covers both.

For a repeating task, the due date is its planned final date. Editing or deleting the series can give it an earlier effective end date without changing what its original deadline meant.

Deleting from a card onward does not delete the rule. It sets the rule's end date to the day before that card, so every earlier card still shows.

**The unit is the card, not the week.** A card is one task on one date. Ticking and deleting act on one card. Editing always acts on this card and every one after it.

**Ticking is per card.** Ticking Wednesday does not tick Friday in the same week, and week 20 does not tick week 21.

---

## 4. Editing and deleting

A repeating task lives on many dates, so its edit dialog must make the scope of every action explicit.

**Save applies from the selected card onward.** The dialog says this clearly, and the save button identifies the scope. There is no single-card save.

Saving splits the rule: the old rule ends the day before the card, and a new rule starts on the card with the edited values. Earlier cards stay unchanged.

**Delete this occurrence** writes a skip for that card. The rest of the series is untouched.

**End the series from this date** ends the rule the day before the card. Earlier cards stay.

Task deletion has no confirmation box. An Undo bar appears for about five seconds in the task area of the day where the deletion began. Its message distinguishes one deleted occurrence from the end of the series. Counts and progress update immediately and revert on Undo.

**Deleting your account is the exception. It does get a real confirm**, because it cannot be undone.

---

## 5. The card

States: plain, has a due date, overdue, done, hover.

**The coloured left bar is the label the user picked.** It never changes to show state. A done task keeps its own colour.

- **Done**: green filled tick, greyed text. The left bar stays the label colour.
- **Overdue**: the stopwatch icon turns red.
- **Hover**: the tick button appears straight away. Its space is reserved in the resting card, so the text does not shift when you hover.
- **Hover, after about 400ms**: the full text appears above the card, but only when the text is actually cut off. The delay stops it flashing as the mouse crosses a row. It is at most 280px wide, ignores the mouse, and flips sides near the edge of the window.

**A due date on a repeating task belongs to the rule.** It shows on every occurrence, and no new cards appear after it. Once the date has passed, the stopwatch turns red on earlier unfinished cards. The due date cannot be removed while repeat is on; turn repeat off to make it optional.

---

## 6. Adding and editing a task

The dialog title shows the action and the date, such as **Add Task · Tuesday, 12 May**. Opening it from a day preselects that day.

The dialog contains the task text, **Days**, a **Repeating Task** option, an optional label colour, and—when repeating is on—an optional **End Date**.

- A task that is not repeating has exactly one selected day.
- A repeating task may have one or more weekdays. Its occurrences can be within the current week, later weeks, or both.
- Turning repeating on keeps the selected day and allows more days. To turn it off, the user must first leave only one day selected. If they try sooner, the option stays on and the dialog asks them to choose one day.
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
| Drag a card to another day | Drag moves one card. The day picker moves every week. They are different actions, and v1 has neither for a single card. |
| Move one card to another day | "Working late this Monday, so gym moves to Tuesday." For now: delete that card, add a one-off on Tuesday. Doing it properly needs a moved-to date on the exception, plus drag as the gesture. That is one nullable column, so it can wait. |
| Label names | Colours are enough to group things. Labels are stored as named values, so names can be added later in code. |
| Reword a single card | Would mean a second kind of save, and a dialog that behaves differently depending on which field was touched. Not worth it for a rare edit. Change the text for all future weeks instead. |
| Carry unfinished tasks forward | A paper planner does not do it, and it hides the fact you did not do the thing. |
| Settings page | The four dropdown items cover everything a settings page would hold. |
| Clickable Figma prototype | A prototype exists to show an idea to someone before it is built. I am both the designer and the builder, and the live app is the demo. |

---
