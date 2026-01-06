// Create posts view to map wall_posts to the expected schema structure
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createPostsView() {
  console.log('📝 Creating posts view...');

  try {
    // Drop existing view if it exists
    await db.execute(sql`DROP VIEW IF EXISTS posts CASCADE`);
    console.log('✓ Dropped existing posts view (if any)');

    // Create posts view that maps wall_posts to the expected structure
    await db.execute(sql`
      CREATE OR REPLACE VIEW posts AS
      SELECT
        wp.id,
        wp.author_id AS creator_id,
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
        wp.comments_count,
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

    console.log('✓ Created posts view mapping to wall_posts');

    // Verify the view works
    const testQuery = await db.execute(sql`
      SELECT COUNT(*) as count FROM posts
    `);

    console.log(`✓ Posts view working! Count: ${testQuery.rows[0].count} posts`);

    console.log('\n✅ Posts view created successfully!');
    console.log('📊 The infinity feed can now query from the posts view');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create posts view:', error);
    console.error(error);
    process.exit(1);
  }
}

createPostsView();
