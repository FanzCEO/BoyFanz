import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkPostsView() {
  try {
    // Check if posts is a view
    const viewCheck = await db.execute(sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'posts'
    `);

    console.log('Posts table/view:');
    console.log(viewCheck.rows);

    if (viewCheck.rows.length > 0 && viewCheck.rows[0].table_type === 'VIEW') {
      const viewDef = await db.execute(sql`
        SELECT definition
        FROM pg_views
        WHERE viewname = 'posts'
      `);

      if (viewDef.rows.length > 0) {
        console.log('\nPosts view definition:');
        console.log(viewDef.rows[0].definition);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPostsView();
