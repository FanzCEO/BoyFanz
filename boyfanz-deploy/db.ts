import * as schema from "@shared/schema";

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
    // Try SQLite configuration with better-sqlite3
    try {
      const Database = require('better-sqlite3');
      const { drizzle } = require('drizzle-orm/better-sqlite3');
      
      const sqlite = new Database(dbUrl.replace("sqlite:", ""));
      db = drizzle(sqlite, { schema });
      console.log(`🗄️ Connected to SQLite database: ${dbUrl.replace("sqlite:", "")}`);
    } catch (sqliteError) {
      console.warn(`⚠️ SQLite connection failed, falling back to mock database:`, sqliteError.message);
      // Create a mock database for development
      db = {
        select: () => ({ from: () => ({ limit: () => [] }) }),
        insert: () => ({ values: () => ({ returning: () => [] }) }),
        update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
        delete: () => ({ where: () => ({ returning: () => [] }) }),
      };
    }
  } else if (isPostgres) {
    // PostgreSQL/Neon configuration
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { drizzle } = require('drizzle-orm/neon-serverless');
    const ws = require('ws');
    
    neonConfig.webSocketConstructor = ws;
    
    pool = new Pool({ 
      connectionString: dbUrl,
      max: 10,                     // Maximum pool size
      idleTimeoutMillis: 30000,    // 30 seconds idle timeout
      maxUses: 7500,               // Reuse connections efficiently
      allowExitOnIdle: false       // Keep pool alive
    });
    
    db = drizzle({ client: pool, schema });
    console.log(`🐘 Connected to PostgreSQL database`);
  } else {
    throw new Error(`Unsupported database URL: ${dbUrl}`);
  }
} catch (error) {
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
