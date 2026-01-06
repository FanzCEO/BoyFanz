// Script to add test posts using raw SQL to avoid schema mismatch
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function seedTestPosts() {
  console.log('🌱 Seeding test posts...');

  // Create test creators
  const testCreators = [
    {
      username: 'alpha_muscle',
      displayName: 'Alpha Muscle',
      email: 'alpha@test.com',
      bio: 'Fitness model & bodybuilder 💪 Premium content daily',
      profileImageUrl: 'https://i.pravatar.cc/300?img=12',
    },
    {
      username: 'beach_boy_blake',
      displayName: 'Beach Boy Blake',
      email: 'blake@test.com',
      bio: 'Surfer 🏄 | Model | Living the beach life',
      profileImageUrl: 'https://i.pravatar.cc/300?img=33',
    },
    {
      username: 'gym_bro_jay',
      displayName: 'Jay Fitness',
      email: 'jay@test.com',
      bio: 'Personal trainer | Workout tips | Lifestyle content',
      profileImageUrl: 'https://i.pravatar.cc/300?img=52',
    },
    {
      username: 'model_marco',
      displayName: 'Marco',
      email: 'marco@test.com',
      bio: 'Professional model | Fashion & lifestyle',
      profileImageUrl: 'https://i.pravatar.cc/300?img=68',
    },
  ];

  const createdCreators = [];

  for (const creator of testCreators) {
    // Check if user exists
    const existing = await db.execute(sql`
      SELECT id FROM users WHERE username = ${creator.username}
    `);

    let userId;
    if (existing.rows.length > 0) {
      console.log(`✓ User ${creator.username} already exists`);
      userId = existing.rows[0].id;
    } else {
      const result = await db.execute(sql`
        INSERT INTO users (
          username, display_name, email, bio, profile_image_url, avatar_url,
          is_creator, is_verified, is_age_verified, email_verified
        )
        VALUES (
          ${creator.username}, ${creator.displayName}, ${creator.email},
          ${creator.bio}, ${creator.profileImageUrl}, ${creator.profileImageUrl},
          true, true, true, true
        )
        RETURNING id
      `);
      userId = result.rows[0].id;
      console.log(`✓ Created user: ${creator.username}`);
    }

    // Check if creator profile exists
    const existingProfile = await db.execute(sql`
      SELECT user_id FROM creator_profiles WHERE user_id = ${userId}
    `);

    if (existingProfile.rows.length === 0) {
      await db.execute(sql`
        INSERT INTO creator_profiles (
          user_id, monthly_price_cents, categories, total_subscribers, total_posts
        )
        VALUES (
          ${userId}, 999, ARRAY['fitness', 'lifestyle', 'modeling']::text[],
          ${Math.floor(Math.random() * 1000) + 100}, 0
        )
      `);
      console.log(`✓ Created creator profile for: ${creator.username}`);
    }

    createdCreators.push({ id: userId, username: creator.username });
  }

  // Create test posts for each creator
  const postTemplates = [
    {
      type: 'photo',
      title: 'Morning workout session 💪',
      content: 'Starting the day right with some heavy lifting! Who else hit the gym this morning? #fitness #motivation',
      mediaUrls: ['https://picsum.photos/800/1000?random=10'],
      visibility: 'free',
    },
    {
      type: 'photo',
      title: 'Beach vibes 🌊',
      content: 'Perfect weather for a beach day! Living my best life 😎',
      mediaUrls: ['https://picsum.photos/800/1000?random=11'],
      visibility: 'free',
    },
    {
      type: 'video',
      title: 'New workout tutorial!',
      content: 'Check out this new exercise routine I put together. Perfect for building strength!',
      mediaUrls: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],
      thumbnailUrl: 'https://picsum.photos/800/600?random=12',
      visibility: 'subscribers',
    },
    {
      type: 'photo',
      title: 'Photoshoot behind the scenes',
      content: 'Had an amazing photoshoot today! More content coming soon 📸',
      mediaUrls: ['https://picsum.photos/800/1000?random=13', 'https://picsum.photos/800/1000?random=14'],
      visibility: 'free',
    },
    {
      type: 'text',
      title: 'Motivation Monday!',
      content: 'Remember: The only bad workout is the one that didn\'t happen. Get out there and crush your goals! 💯\n\nWhat are you working on this week?',
      visibility: 'free',
    },
  ];

  let totalPostsCreated = 0;

  for (const creator of createdCreators) {
    // Create 3-5 posts per creator
    const numPosts = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numPosts; i++) {
      const template = postTemplates[Math.floor(Math.random() * postTemplates.length)];

      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 48));

      await db.execute(sql`
        INSERT INTO posts (
          creator_id, type, title, content, media_urls, thumbnail_url,
          visibility, price_cents, is_processing, likes_count, comments_count,
          views_count, created_at
        )
        VALUES (
          ${creator.id}, ${template.type}, ${template.title}, ${template.content},
          ${JSON.stringify(template.mediaUrls || [])}::jsonb,
          ${template.thumbnailUrl || null},
          ${template.visibility}, 0, false,
          ${Math.floor(Math.random() * 100)},
          ${Math.floor(Math.random() * 20)},
          ${Math.floor(Math.random() * 500)},
          ${createdAt.toISOString()}
        )
      `);

      totalPostsCreated++;
    }

    // Update creator's post count
    await db.execute(sql`
      UPDATE creator_profiles
      SET total_posts = ${numPosts}
      WHERE user_id = ${creator.id}
    `);

    console.log(`✓ Created ${numPosts} posts for: ${creator.username}`);
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`📊 Created ${createdCreators.length} creators`);
  console.log(`📝 Created ${totalPostsCreated} posts`);
  console.log(`\n🎉 Your feed should now have content!`);
}

seedTestPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
