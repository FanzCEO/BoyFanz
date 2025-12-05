import * as schema from "@shared/schema";
import { Pool } from 'pg';
import { drizzle as drizzleNodePostgres } from 'drizzle-orm/node-postgres';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbUrl = process.env.DATABASE_URL;
const isSqlite = dbUrl.startsWith("sqlite:");
const isPostgres = dbUrl.startsWith("postgresql:") || dbUrl.startsWith("postgres:");

let db: any;
let pool: any = null;

// Initialize database with error handling
try {
  if (isSqlite) {
    // SQLite is not supported in production ESM builds
    console.warn(`⚠️ SQLite not supported in production build, using mock database`);
    db = {
      select: () => ({ from: () => ({ limit: () => [] }) }),
      insert: () => ({ values: () => ({ returning: () => [] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
      delete: () => ({ where: () => ({ returning: () => [] }) }),
    };
  } else if (isPostgres) {
    // Standard PostgreSQL (Supabase, Railway, Neon, etc) - use node-postgres driver
    pool = new Pool({
      connectionString: dbUrl,
      max: 10,                     // Maximum pool size
      idleTimeoutMillis: 30000,    // 30 seconds idle timeout
      connectionTimeoutMillis: 5000, // 5 seconds connection timeout
    });

    db = drizzleNodePostgres(pool, { schema });
    console.log(`🐘 Connected to PostgreSQL database (node-postgres)`);
  } else {
    throw new Error(`Unsupported database URL: ${dbUrl}`);
  }
} catch (error: any) {
  console.error(`❌ Database connection failed:`, error.message);
  console.log(`🔧 Using mock database for development`);

  // Mock database for development when real connection fails
  db = {
    select: () => ({ from: () => ({ limit: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  };
}

export { db, pool };
