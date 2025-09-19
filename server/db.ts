import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool for production stability
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,                     // Maximum pool size
  idleTimeoutMillis: 30000,    // 30 seconds idle timeout
  maxUses: 7500,               // Reuse connections efficiently
  allowExitOnIdle: false       // Keep pool alive
});

export const db = drizzle({ client: pool, schema });