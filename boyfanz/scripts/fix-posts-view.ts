// Fix posts view with correct type casting
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixPostsView() {
  console.log('🔧 Fixing posts view with type casting...');

  try {
    // Drop existing view
    await db.execute(sql`DROP VIEW IF EXISTS posts CASCADE`);
    console.log('✓ Dropped existing posts view');

    // Create posts view with proper type casting
    await db.execute(sql`
      CREATE OR REPLACE VIEW posts AS
      SELECT
        wp.id::text AS id,
        wp.author_id::text AS creator_id,
        wp.type::text AS type,
        'free'::text AS visibility,
        NULL AS title,
        wp.content,
        0 AS price_cents,
        COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(wp.media_urls)),
          ARRAY[]::text[]
        ) AS media_urls,
        NULL AS thumbnail_url,
        ARRAY[]::text[] AS hashtags,
        false AS is_scheduled,
        NULL AS scheduled_for,
        0 AS likes_count,
        COALESCE(wp.comments_count, 0) AS comments_count,
        0 AS views_count,
        0 AS reposts_count,
        0 AS quotes_count,
        NULL AS poll_id,
        false AS is_processing,
        'completed' AS processing_status,
        NULL AS expires_at,
        wp.created_at,
        wp.updated_at
      FROM wall_posts wp
    `);

    console.log('✓ Created posts view with type casting');

    // Verify join works
    const testQuery = await db.execute(sql`
      SELECT
        p.id,
        p.creator_id,
        u.id as user_id,
        u.username,
        u.display_name,
        p.content
      FROM posts p
      INNER JOIN users u ON p.creator_id = u.id
      LIMIT 5
    `);

    console.log(`\n✓ Join test successful! Found ${testQuery.rows.length} posts:`);
    testQuery.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.username} - ${row.content?.substring(0, 50)}...`);
    });

    console.log('\n✅ Posts view fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix posts view:', error);
    console.error(error);
    process.exit(1);
  }
}

fixPostsView();
