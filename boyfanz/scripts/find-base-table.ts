import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function findBaseTables() {
  try {
    // Find all tables (not views)
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name LIKE '%user%'
      ORDER BY table_name
    `);

    console.log('User-related tables:');
    console.log(tables.rows);

    // Get view definition for users
    const viewDef = await db.execute(sql`
      SELECT definition
      FROM pg_views
      WHERE viewname = 'users'
    `);

    if (viewDef.rows.length > 0) {
      console.log('\nUsers view definition:');
      console.log(viewDef.rows[0].definition);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findBaseTables();
