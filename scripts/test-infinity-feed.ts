// Test infinity feed query to verify it's working
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function testInfinityFeed() {
  console.log('🧪 Testing infinity feed query...\n');

  try {
    // 1. Check posts exist
    const postsCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM posts
    `);
    console.log(`1. Posts in view: ${postsCount.rows[0].count}`);

    // 2. Check users exist
    const usersCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM users WHERE is_creator = true
    `);
    console.log(`2. Creator users: ${usersCount.rows[0].count}`);

    // 3. Test the actual infinity feed query
    const feedQuery = await db.execute(sql`
      SELECT
        p.id,
        p.creator_id,
        p.type,
        p.content,
        p.media_urls,
        p.created_at,
        u.id as user_id,
        u.username as creator_handle,
        u.display_name as creator_name,
        u.avatar_url as creator_avatar,
        u.is_verified as creator_verified
      FROM posts p
      INNER JOIN users u ON p.creator_id = u.id
      WHERE u.is_creator = true
      ORDER BY p.created_at DESC
      LIMIT 12
    `);

    console.log(`\n3. Infinity feed query result: ${feedQuery.rows.length} posts\n`);

    if (feedQuery.rows.length > 0) {
      console.log('✅ FEED IS WORKING! Sample posts:');
      feedQuery.rows.slice(0, 5).forEach((post: any, i: number) => {
        console.log(`   ${i + 1}. @${post.creator_handle} - ${post.type} - "${post.content?.substring(0, 50)}..."`);
      });
    } else {
      console.log('❌ FEED IS EMPTY - No posts returned from query');
    }

    // 4. Check wall_posts table directly
    const wallPostsCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM wall_posts
    `);
    console.log(`\n4. Wall posts table: ${wallPostsCount.rows[0].count} posts`);

    // 5. Test type casting
    const typeCastTest = await db.execute(sql`
      SELECT
        pg_typeof(p.id) as id_type,
        pg_typeof(p.creator_id) as creator_id_type,
        pg_typeof(u.id) as user_id_type
      FROM posts p
      INNER JOIN users u ON p.creator_id = u.id
      LIMIT 1
    `);

    if (typeCastTest.rows.length > 0) {
      console.log('\n5. Type casting check:');
      console.log(`   posts.id type: ${typeCastTest.rows[0].id_type}`);
      console.log(`   posts.creator_id type: ${typeCastTest.rows[0].creator_id_type}`);
      console.log(`   users.id type: ${typeCastTest.rows[0].user_id_type}`);
    }

    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testInfinityFeed();
