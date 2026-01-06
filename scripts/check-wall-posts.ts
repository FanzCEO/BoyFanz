import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkWallPosts() {
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'wall_posts'
      ORDER BY ordinal_position
    `);

    console.log('WALL_POSTS columns:');
    console.log(result.rows);

    // Check if there are any existing posts
    const count = await db.execute(sql`
      SELECT COUNT(*) as count FROM wall_posts
    `);

    console.log('\nExisting wall_posts count:', count.rows[0].count);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkWallPosts();
