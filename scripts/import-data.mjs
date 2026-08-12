import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const source = process.argv[2];
if (!source) throw new Error("Usage: node scripts/import-data.mjs <export.json>");
if (!process.env.DATABASE_URL_UNPOOLED) throw new Error("DATABASE_URL_UNPOOLED is not configured");

const data = JSON.parse(await readFile(source, "utf8"));
const sql = neon(process.env.DATABASE_URL_UNPOOLED);

for (const row of data.locations ?? []) {
  await sql`INSERT INTO locations (id, name, slug, venue, address, key_color, last_count)
    VALUES (${row.id}, ${row.name}, ${row.slug}, ${row.venue}, ${row.address}, ${row.keyColor}, ${row.lastCount})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, venue = EXCLUDED.venue,
      address = EXCLUDED.address, key_color = EXCLUDED.key_color, last_count = EXCLUDED.last_count`;
}

for (const row of data.events ?? []) {
  await sql`INSERT INTO events (id, location_id, slug, edition, event_date, venue, address, participation_fee, one_drink_order, is_open)
    VALUES (${row.id}, ${row.locationId}, ${row.slug}, ${row.edition}, ${row.eventDate}, ${row.venue}, ${row.address},
      ${row.participationFee ?? ""}, ${Boolean(row.oneDrinkOrder)}, ${Boolean(row.isOpen)})
    ON CONFLICT (id) DO UPDATE SET location_id = EXCLUDED.location_id, slug = EXCLUDED.slug, edition = EXCLUDED.edition,
      event_date = EXCLUDED.event_date, venue = EXCLUDED.venue, address = EXCLUDED.address,
      participation_fee = EXCLUDED.participation_fee, one_drink_order = EXCLUDED.one_drink_order, is_open = EXCLUDED.is_open`;
}

for (const row of data.registrations ?? []) {
  await sql`INSERT INTO registrations (id, event_id, name, status, affiliation, is_first_time, topic, created_at)
    VALUES (${row.id}, ${row.eventId}, ${row.name}, ${row.status}, ${row.affiliation}, ${Boolean(row.isFirstTime)},
      ${row.topic ?? ""}, ${row.createdAt})
    ON CONFLICT (id) DO UPDATE SET event_id = EXCLUDED.event_id, name = EXCLUDED.name, status = EXCLUDED.status,
      affiliation = EXCLUDED.affiliation, is_first_time = EXCLUDED.is_first_time, topic = EXCLUDED.topic,
      created_at = EXCLUDED.created_at`;
}

await sql`SELECT setval(pg_get_serial_sequence('locations', 'id'), COALESCE((SELECT MAX(id) FROM locations), 1), true)`;
await sql`SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE((SELECT MAX(id) FROM events), 1), true)`;
await sql`SELECT setval(pg_get_serial_sequence('registrations', 'id'), COALESCE((SELECT MAX(id) FROM registrations), 1), true)`;

console.log(JSON.stringify({ locations: data.locations?.length ?? 0, events: data.events?.length ?? 0, registrations: data.registrations?.length ?? 0 }));
