import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkTables() {
  try {
    const tables = ['profiles', 'accounts', 'creator_profiles'];

    for (const table of tables) {
      const result = await db.execute(sql.raw(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${table}'
        ORDER BY ordinal_position
      `));

      console.log(`\n${table.toUpperCase()} columns:`);
      console.log(result.rows);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
