import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Note: rejectUnauthorized: false is required for Supabase connection pooler (port 6543)
  // The pooler uses a different certificate than the direct database connection
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });

console.log("\ud83d\udc18 Connected to PostgreSQL database");
