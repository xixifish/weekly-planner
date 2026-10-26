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
- Arrows next to the week's dates move to the previous or next week. **Today** returns to the current week.
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

Turning on **Repeating Task** makes the selected weekdays a repeating pattern. A new repeating task starts on the Monday of the week it is added to. For example, adding a Mon/Wed/Fri task on Wednesday also shows it on that week's Monday, which has already passed. The user plans the whole week, not just the days left in it. Dates before the start are never created. The optional end date is the last date on which an occurrence may appear.

Occurrences are worked out when a week is opened rather than stored in advance. Changes to a single occurrence are stored separately from the repeating rule.

**The unit is the card, not the week.** A card is one task occurrence on one date.

**Ticking is per card.** Ticking Wednesday does not tick Friday in the same week, and week 20 does not tick week 21.

---

## 4. Editing and deleting

A non-repeating task uses direct **Save** and **Delete** actions. For a repeating task, each action opens a menu with **This Task Only** and **This and Future Tasks**.

Deleting a non-repeating task removes its one card, the same as **This Task Only**. Turning **Repeating Task** on while editing a non-repeating task makes it a repeating task that starts on the Monday of the card's week, the same as adding one.

**This Task Only** changes or deletes only the selected card. The repeating pattern remains unchanged.

**This and Future Tasks** includes later occurrences in the same week and in later weeks. Earlier occurrences remain unchanged. Saving splits the repeating rule at the selected card; deleting stops it there.

Later cards changed with **This Task Only** keep that change when **This and Future Tasks** is saved: a deleted card stays deleted, and an edited card keeps its own text and label. _To be checked in user testing._

Save scope depends on the fields changed:

| Field                | This Task Only | This and Future Tasks |
| -------------------- | -------------: | --------------------: |
| Description or label |            Yes |                   Yes |
| Days                 |             No |                   Yes |
| End Date             |             No |                   Yes |

If the days or the end date change, **This Task Only** is no longer possible, so the **Save** menu is replaced by a direct **Save This and Future Tasks** button. The button's label says what will happen, so no extra message is needed. Changing the days back brings the menu back.

**A repeating task stays repeating.** Its **Repeating** option cannot be turned off while editing; trying shows a grey message: "To stop repeating, add an **End Date** or use **Delete This and Future Tasks**." Those two existing actions cover what turning it off would mean, without extra rules about which day a remaining one-off task would land on. To keep a single task on another day, the user deletes this and future tasks, then adds a non-repeating task.

Task deletion has no confirmation box and, in v1, no Undo: a deleted card is gone immediately, and counts and progress update straight away. A mistaken single card is quick to add again.

**Deleting your account is the exception. It does get a real confirm**, because it removes everything at once and cannot be undone.

---

## 5. The card

States: plain, done, hover.

**The coloured left bar is the label the user picked.** It never changes to show state. A done task keeps its own colour.

- **Done**: green filled tick, greyed and struck-through text, and a grey background with no shadow. The left bar stays the label colour.
- **Hover**: the tick slides in from the left, and the text moves right to make room. The card's border turns blue. A done card always shows its tick and has no hover effect.
- **Full text**: v1 uses the browser's built-in tooltip (the `title` attribute) on the card text.

_To do: replace it with a custom tooltip._ After about 400ms of hover, the full text appears above the card, but only when the text is actually cut off. The delay stops it flashing as the mouse crosses a row. It is at most 280px wide, ignores the mouse, and flips sides near the edge of the window. It also appears on keyboard focus.

The end date controls recurrence only. It is not a deadline and does not create an overdue card state.

---

## 6. Adding and editing a task

Tasks are added with the floating **+** button at the bottom right. The dialog adds to the week being viewed: its title shows that week in the same format as the week header, such as **Add Task · Aug 31 - Sep 6**, and the selected day sets the date within it. No day is preselected; the user chooses one. A repeating task keeps the same title, with the week range rather than the rule's start date (that week's Monday), because the first card may be on a later day, such as Wednesday.

When editing, the title shows the card's own date, such as **Edit Task · Sep 1**, because **This Task Only** applies to that date.

There are only two titles, **Add Task** and **Edit Task**. The title never says "Repeating": the **Repeating** toggle shows it, and when editing, so do the **Save** and **Delete** menus. This also keeps the title from changing while the user clicks the toggle.

The dialog contains the task text, **Days**, a **Repeating Task** option, an optional label colour, and—when repeating is on—an optional **End Date**.

- A task that is not repeating has exactly one selected day.
- A repeating task may have one or more weekdays. Its occurrences can be within the current week, later weeks, or both.
- Turning repeating on keeps the selected day and allows more days. When adding a task (or editing a non-repeating one), turning it off again requires leaving only one day selected first. If they try sooner, the option stays on and the dialog asks them to choose one day. Turning it off automatically removes the end date.
- Selecting a second day while repeating is off never unselects the first one. Both stay selected, Save is disabled, and the dialog asks the user to turn on **Repeating Task** or choose one day. Nothing changes behind the user's back.
- No end date means the task repeats indefinitely. An end date is inclusive and cannot be before the task starts. Removing it returns the task to indefinite repetition.
- Text and a day are required; label and end date are optional. Save stays disabled until the required fields are valid.
- The text box scrolls for long text. Titles contain no line breaks, spaces alone are invalid, and text is limited to 1000 characters.
- Closing the add dialog with **Cancel** or Esc keeps what was typed, so an accidental close loses nothing. The draft lasts until the page reloads or a card is opened for editing, since adding and editing share one dialog. Saving closes the dialog and clears the form.

Creating a task and editing a non-repeating task use a direct **Save** action. When editing a repeating task, **Save** and **Delete** each open a menu with two scopes: **This Task Only** and **This and Future Tasks**.

**Layout.** The title sits in a header band and the buttons in a footer band, each separated from the form by a full-width line. Each section has a bold heading with a short grey hint:

- **Weekdays:** only repeating tasks can have several days. **Repeating** comes first in the row, before Mon–Sun, separated by a thin divider, because it is a mode switch rather than a day and people decide it first.
- **End Date:** leave blank to repeat indefinitely (shown only for a repeating task).
- **Label:** optional.

**Messages.** Each message is a full-width banner directly above what it is about. Errors are dark red on a light red background; information is grey.

| Message                                                                                | Where              | When                                                            |
| -------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------- |
| Enter a task description                                                               | above the text box | the text was typed, then emptied or left as spaces              |
| Choose one day, or turn on repeating                                                   | above the day row  | two or more days while repeating is off                         |
| Leave one day to turn off repeating                                                    | above the day row  | turning repeating off with two or more days                     |
| To stop repeating, add an **End Date** or use **Delete This and Future Tasks**. (grey) | above the day row  | trying to turn off **Repeating** while editing a repeating task |
| Save and delete errors from the server                                                 | above the buttons  | the action failed; the dialog stays open                        |
| Your session has expired. **Sign in again**                                            | above the buttons  | the session ended; the link signs in with Google                |

Signing in again leaves the page, so the dialog's draft is lost. The user comes back to the same week they were viewing.
---

## 7. Accounts

**Sign in with social accounts only.** No email and password.

**The profile dropdown has four things**: name, email, **Sign out**, **Delete this account**.

Four, not one, because social sign-in means you need to see _which_ account you are in, and because storing someone's data means giving them a way to remove it. The avatar itself must never sign you out — the dropdown is the safety.

**There is no settings page.** Those four items make one unnecessary.

**The Colour Theme choice** (System · Light · Dark) sits between the name and **Sign out**; see §9.

**The Privacy Policy** (`/privacy`) is linked in small grey text at the bottom of the dropdown, and from Google's sign-in screen.

**A new user sees the empty week** after signing in, the same as before signing in. No onboarding, no sample data.

---

## 8. Cut from v1, and why

| Cut                            | Why                                                                                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phone layout                   | Below 1024px is a different design, not a smaller one. v1 is desktop.                                                                                                                                                                                |
| Drag a card to another day     | Drag moves one occurrence, while the day picker changes the repeating pattern. They are different actions.                                                                                                                                           |
| Move one card to another day   | "Working late this Monday, so gym moves to Tuesday." For now: delete that card, then add a non-repeating task on Tuesday.                                                                                                                            |
| Label names                    | Colours are enough to group things. Labels are stored as named values, so names can be added later in code.                                                                                                                                          |
| Carry unfinished tasks forward | A paper planner does not do it, and it hides the fact you did not do the thing.                                                                                                                                                                      |
| Settings page                  | The four dropdown items cover everything a settings page would hold.                                                                                                                                                                                 |
| Undo after deleting a task     | Planned as a bar that appears for a few seconds after a delete. Left out of v1 to keep the first version small; deletes are immediate instead. Worth revisiting if user testing shows accidental deletes, especially with **This and Future Tasks**. |
| Clickable Figma prototype      | A prototype exists to show an idea to someone before it is built. I am both the designer and the builder, and the live app is the demo.                                                                                                              |

---

## 9. Dark mode

**The theme follows the system setting by default.** The profile menu has a **Colour Theme** choice, **System · Light · Dark**, for people who want one theme whatever their device is set to. **System** stays the way back to following the device. It is a segmented control, because all three choices and the current one are visible at once; a single sun/moon switch could not show **System**.

**The choice is remembered per device,** in a cookie, not in the account: someone may want dark on their laptop and light on their phone. The server reads the cookie and draws the page in that theme straight away, so there is no flash of the wrong theme while the page loads. Signed-out visitors have no profile menu, so they always follow the system.

**Every colour is a token with a light and a dark value** in `app/globals.css`, written as `light-dark(light, dark)`. Components never name a colour directly, so they need no dark-mode code.

**Tokens are named for their role, not their colour.** White backgrounds use `surface`, which is dark in dark mode. When one colour had two roles, it was split, because the roles need different things in the dark:

- **Fills with white text on them** keep their deep colour: `logo-blue` and `selected-blue` (Save, +), `error-red` and `error-red-dark` (the confirm Delete button), `check-green`.
- **Text and lines** get lighter in the dark: `link-blue` and `link-blue-hover` (links, Cancel, selected days, the app-wide hover), `delete-red` and `delete-red-hover` (Delete buttons and menu), `error-text` (error banners). In light mode they have the same values as the fills, so nothing changed there.
- **Hovers add contrast in both themes:** darker on white, lighter on dark.
- **Raised things are lighter in the dark:** the selected Colour Theme option uses `surface-raised`, white in light mode and a step lighter than its grey track in dark mode, so it looks raised in both.

**A disabled button rests on the page:** a flat fill just above the surface, with dimmed text (`button-off-grey`, `button-off-text`), so it never looks clickable.

**Contrast:** every text colour reaches 4.5:1 on the backgrounds it sits on in both themes. Label colours, the logo and the tick are graphics and stay the same in both themes.

---

## 10. To do after v1

Planned, but not part of the first version.

| To do                           | Notes                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo on Google's sign-in screen | Needs Google's brand verification: proof of owning the domain in Search Console, and a Privacy Policy link that signed-out visitors can see on the home page. |
