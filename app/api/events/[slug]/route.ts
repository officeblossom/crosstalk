import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events, locations } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event] = await getDb().select({
    id: events.id, slug: events.slug, edition: events.edition,
    eventDate: events.eventDate, venue: events.venue, isOpen: events.isOpen,
    locationName: locations.name,
  }).from(events).innerJoin(locations, eq(events.locationId, locations.id))
    .where(eq(events.slug, slug)).limit(1);
  return event ? Response.json({ event }) : Response.json({ error: "イベントが見つかりません" }, { status: 404 });
}
