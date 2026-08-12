import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!database) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
    database = drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  return database;
}
