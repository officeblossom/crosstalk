import { and, asc, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { events, locations } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const rows = await db.select({
    id: events.id, slug: events.slug, edition: events.edition,
    eventDate: events.eventDate, venue: events.venue, address: events.address,
    participationFee: events.participationFee, oneDrinkOrder: events.oneDrinkOrder, isOpen: events.isOpen,
    locationName: locations.name, keyColor: locations.keyColor, defaultVenue: locations.venue,
  }).from(events).innerJoin(locations, eq(events.locationId, locations.id))
    .where(and(eq(events.isOpen, true), gte(events.eventDate, today))).orderBy(asc(events.eventDate));
  return Response.json({ events: rows });
}
