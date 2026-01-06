// Debug infinity feed query
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function debugInfinityFeed() {
  console.log('🔍 Debugging infinity feed...\n');

  try {
    // Check posts view
    const postsCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM posts
    `);
    console.log('1. Posts view count:', postsCount.rows[0].count);

    // Check users view
    const usersCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM users WHERE is_creator = true
    `);
    console.log('2. Creator users count:', usersCount.rows[0].count);

    // Check if posts can join with users
    const joinTest = await db.execute(sql`
      SELECT
        p.id,
        p.creator_id,
        u.id as user_id,
        u.username,
        u.display_name
      FROM posts p
      LEFT JOIN users u ON p.creator_id = u.id
      LIMIT 5
    `);
    console.log('\n3. Posts joined with users:');
    console.log(joinTest.rows);

    // Check what the infinity feed query would return
    const feedQuery = await db.execute(sql`
      SELECT
        p.id,
        p.creator_id,
        u.username as creator_handle,
        u.display_name as creator_name,
        p.type,
        p.visibility,
        p.content,
        p.media_urls,
        p.created_at
      FROM posts p
      INNER JOIN users u ON p.creator_id = u.id
      WHERE u.is_creator = true
      ORDER BY p.created_at DESC
      LIMIT 12
    `);

    console.log('\n4. Infinity feed query results:');
    console.log(`   Found ${feedQuery.rows.length} posts`);
    feedQuery.rows.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.creator_handle} - ${post.type} - ${post.content?.substring(0, 50)}...`);
    });

    // Check profiles table
    const profilesCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM profiles WHERE type = 'creator'
    `);
    console.log('\n5. Creator profiles count:', profilesCount.rows[0].count);

    // Check wall_posts
    const wallPostsCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM wall_posts
    `);
    console.log('6. Wall posts count:', wallPostsCount.rows[0].count);

    process.exit(0);
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugInfinityFeed();
