import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { events, locations, registrations } from "@/db/schema";

const STATUS_LABELS: Record<string, string> = { student: "学生", worker: "社会人", other: "その他" };

function discordValue(value: string, fallback = "未入力") {
  return (value || fallback).slice(0, 1024);
}

async function notifyDiscord(details: {
  eventName: string; eventDate: string; name: string; status: string; affiliation: string;
  socialMedia: string; isFirstTime: boolean; topic: string;
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "Cross Talk 参加フォーム",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: "新しい参加申し込みがありました",
        color: 0x1b3e51,
        fields: [
          { name: "イベント", value: discordValue(details.eventName), inline: false },
          { name: "開催日", value: discordValue(details.eventDate), inline: true },
          { name: "お名前", value: discordValue(details.name), inline: true },
          { name: "ステータス", value: discordValue(STATUS_LABELS[details.status] ?? details.status), inline: true },
          { name: "所属", value: discordValue(details.affiliation), inline: true },
          { name: "参加経験", value: details.isFirstTime ? "初参加" : "参加経験あり", inline: true },
          { name: "SNS等", value: discordValue(details.socialMedia), inline: false },
          { name: "話してみたいこと", value: discordValue(details.topic), inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
    }),
  });
  if (!response.ok) throw new Error(`Discord webhook failed: ${response.status}`);
}

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
  const [event] = await db.select({
    id: events.id, edition: events.edition, eventDate: events.eventDate, isOpen: events.isOpen,
    locationName: locations.name,
  }).from(events).innerJoin(locations, eq(events.locationId, locations.id)).where(eq(events.id, eventId)).limit(1);
  if (!event?.isOpen) return Response.json({ error: "このフォームは受付を終了しています" }, { status: 400 });
  await db.insert(registrations).values({ eventId, name, status, affiliation, socialMedia, isFirstTime, topic });
  try {
    await notifyDiscord({
      eventName: `第${event.edition}回 Cross Talk${event.locationName}`,
      eventDate: event.eventDate, name, status, affiliation, socialMedia, isFirstTime, topic,
    });
  } catch (error) {
    console.error("Failed to send Discord registration notification", error);
  }
  return Response.json({ ok: true }, { status: 201 });
}
