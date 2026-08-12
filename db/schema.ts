import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  venue: text("venue").notNull(),
  lastCount: integer("last_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  locationId: integer("location_id").notNull().references(() => locations.id),
  slug: text("slug").notNull().unique(),
  edition: integer("edition").notNull(),
  eventDate: text("event_date").notNull(),
  venue: text("venue").notNull(),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id),
  name: text("name").notNull(),
  status: text("status").notNull(),
  affiliation: text("affiliation").notNull(),
  isFirstTime: integer("is_first_time", { mode: "boolean" }).notNull(),
  topic: text("topic").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
