import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  venue: text("venue").notNull(),
  address: text("address").notNull().default(""),
  keyColor: text("key_color").notNull().default("#42210b"),
  lastCount: integer("last_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  slug: text("slug").notNull().unique(),
  edition: integer("edition").notNull(),
  eventDate: text("event_date").notNull(),
  venue: text("venue").notNull(),
  address: text("address").notNull().default(""),
  participationFee: text("participation_fee").notNull().default(""),
  oneDrinkOrder: boolean("one_drink_order").notNull().default(false),
  isOpen: boolean("is_open").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  name: text("name").notNull(),
  status: text("status").notNull(),
  affiliation: text("affiliation").notNull(),
  socialMedia: text("social_media").notNull().default(""),
  isFirstTime: boolean("is_first_time").notNull(),
  topic: text("topic").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});
