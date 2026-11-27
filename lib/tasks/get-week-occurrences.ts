import { requireCurrentUser } from "../current-user";
import { getWeekOccurrencesForUser } from "./get-week-occurrences-for-user";

// The web app's version: the user comes from the sign-in cookie
export async function getWeekOccurrences(weekStart: Date) {
  const user = await requireCurrentUser();
  return getWeekOccurrencesForUser(user.id, weekStart);
}
