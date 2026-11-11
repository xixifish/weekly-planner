import { deleteOldGuests } from "@/lib/guests/delete-old-guests";

// Vercel Cron calls this once a day, sending CRON_SECRET as a bearer token
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  // Refuse everyone else, and everyone if the secret was never set
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const deleted = await deleteOldGuests(new Date());

  console.log(`Deleted ${deleted} old guest accounts`);

  return Response.json({ deleted });
}
