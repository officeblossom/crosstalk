CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer NOT NULL,
	"slug" text NOT NULL,
	"edition" integer NOT NULL,
	"event_date" text NOT NULL,
	"venue" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"participation_fee" text DEFAULT '' NOT NULL,
	"one_drink_order" boolean DEFAULT false NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"venue" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"key_color" text DEFAULT '#42210b' NOT NULL,
	"last_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_name_unique" UNIQUE("name"),
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"affiliation" text NOT NULL,
	"is_first_time" boolean NOT NULL,
	"topic" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;