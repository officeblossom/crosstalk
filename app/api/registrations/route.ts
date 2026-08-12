import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events, registrations } from "@/db/schema";

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const eventId = Number(body.eventId);
  const name = String(body.name ?? "").trim();
  const status = String(body.status ?? "");
  const affiliation = String(body.affiliation ?? "").trim();
  const socialMedia = String(body.socialMedia ?? "").trim();
  const topic = String(body.topic ?? "").trim();
  const isFirstTime = body.isFirstTime === true;
  if (!eventId || !name || !affiliation || !["student", "worker", "other"].includes(status)) {
    return Response.json({ error: "必須項目を入力してください" }, { status: 400 });
  }
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  if (!event?.isOpen) return Response.json({ error: "このフォームは受付を終了しています" }, { status: 400 });
  await db.insert(registrations).values({ eventId, name, status, affiliation, socialMedia, isFirstTime, topic });
  return Response.json({ ok: true }, { status: 201 });
}
