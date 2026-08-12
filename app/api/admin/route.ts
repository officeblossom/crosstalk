import { desc, eq, sql } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { events, locations, registrations } from "@/db/schema";

const DEFAULT_LOCATIONS = [
  { name: "Tanga", slug: "tanga", venue: "Tanga Table", address: "福岡県北九州市小倉北区馬借1丁目5-25 ホラヤビル4F", keyColor: "#f1e6d4", lastCount: 12 },
  { name: "Orio", slug: "orio", venue: "おっちーハウスA棟", address: "福岡県北九州市八幡西区折尾1丁目5-6", keyColor: "#42210b", lastCount: 7 },
  { name: "Moji", slug: "moji", venue: "YARD（岡野バルブ製造株式会社 1F）", address: "福岡県北九州市門司区中町1-14", keyColor: "#c1272d", lastCount: 1 },
];

function authorized(request: Request) {
  const runtime = env as unknown as { ADMIN_PASSWORD?: string };
  return request.headers.get("x-admin-password") === (runtime.ADMIN_PASSWORD || "crosstalk2025");
}

async function seed() {
  const db = getDb();
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(locations);
  if (!count) await db.insert(locations).values(DEFAULT_LOCATIONS);
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "パスコードが違います" }, { status: 401 });
  await seed();
  const db = getDb();
  const locationRows = await db.select().from(locations).orderBy(locations.id);
  const eventRows = await db.select({
    id: events.id, slug: events.slug, edition: events.edition, eventDate: events.eventDate,
    venue: events.venue, address: events.address, participationFee: events.participationFee,
    oneDrinkOrder: events.oneDrinkOrder, isOpen: events.isOpen, locationName: locations.name,
    registrationCount: sql<number>`count(${registrations.id})`,
  }).from(events).innerJoin(locations, eq(events.locationId, locations.id))
    .leftJoin(registrations, eq(registrations.eventId, events.id))
    .groupBy(events.id).orderBy(desc(events.eventDate));
  return Response.json({ locations: locationRows, events: eventRows });
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "パスコードが違います" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const db = getDb();
  if (body.action === "createLocation") {
    const name = String(body.name ?? "").trim();
    const venue = String(body.venue ?? "").trim();
    const address = String(body.address ?? "").trim();
    const keyColor = String(body.keyColor ?? "").trim().toLowerCase();
    const slug = String(body.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!name || !venue || !address || !slug || !/^#[0-9a-f]{6}$/.test(keyColor)) return Response.json({ error: "地域名・URL名・会場・住所・カラーコードを確認してください" }, { status: 400 });
    await db.insert(locations).values({ name, venue, address, keyColor, slug, lastCount: Number(body.lastCount) || 0 });
  } else if (body.action === "createEvent") {
    const locationId = Number(body.locationId);
    const edition = Number(body.edition);
    const eventDate = String(body.eventDate ?? "");
    const venue = String(body.venue ?? "").trim();
    const address = String(body.address ?? "").trim();
    const participationFee = String(body.participationFee ?? "").trim();
    const oneDrinkOrder = body.oneDrinkOrder === true;
    const [location] = await db.select().from(locations).where(eq(locations.id, locationId)).limit(1);
    if (!location || !edition || !eventDate || !venue || !address) return Response.json({ error: "開催情報を確認してください" }, { status: 400 });
    const slug = `${location.slug}-${eventDate.replaceAll("-", "")}-${edition}`;
    await db.insert(events).values({ locationId, edition, eventDate, venue, address, participationFee, oneDrinkOrder, slug });
    if (edition > location.lastCount) await db.update(locations).set({ lastCount: edition }).where(eq(locations.id, locationId));
  } else if (body.action === "toggleEvent") {
    await db.update(events).set({ isOpen: body.isOpen === true }).where(eq(events.id, Number(body.eventId)));
  } else if (body.action === "deleteLocation") {
    await db.delete(locations).where(eq(locations.id, Number(body.locationId)));
  } else {
    return Response.json({ error: "不明な操作です" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
