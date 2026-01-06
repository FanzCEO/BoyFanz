import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function findPostsTables() {
  try {
    const result = await db.execute(sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%post%'
      ORDER BY table_name
    `);

    console.log('Post-related tables:');
    console.log(result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findPostsTables();
