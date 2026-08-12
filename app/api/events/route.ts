import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events, locations } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const rows = await db.select({
    id: events.id, slug: events.slug, edition: events.edition,
    eventDate: events.eventDate, venue: events.venue, address: events.address, isOpen: events.isOpen,
    locationName: locations.name, keyColor: locations.keyColor,
  }).from(events).innerJoin(locations, eq(events.locationId, locations.id))
    .where(eq(events.isOpen, true)).orderBy(asc(events.eventDate));
  return Response.json({ events: rows });
}
