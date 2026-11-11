import { addDays } from "@/lib/dates/week";
import { prisma } from "@/lib/prisma";

// How long a guest account is kept
export const GUEST_LIFETIME_DAYS = 7;

// Deletes the guest accounts created more than 7 days before `now`,
// and returns how many were deleted
export async function deleteOldGuests(now: Date) {
  const cutoff = addDays(now, -GUEST_LIFETIME_DAYS);

  const { count } = await prisma.user.deleteMany({
    where: {
      isAnonymous: true,
      createdAt: { lt: cutoff },
    },
  });

  return count;
}
