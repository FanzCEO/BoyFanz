// Final working seed script using correct base tables
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function seedTestPosts() {
  console.log('🌱 Seeding test posts...');

  // Create test creators
  const testCreators = [
    {
      handle: 'alpha_muscle',
      displayName: 'Alpha Muscle',
      email: 'alpha@test.com',
      bio: 'Fitness model & bodybuilder 💪 Premium content daily',
      avatarUrl: 'https://i.pravatar.cc/300?img=12',
      bannerUrl: 'https://picsum.photos/1200/400?random=1',
    },
    {
      handle: 'beach_boy_blake',
      displayName: 'Beach Boy Blake',
      email: 'blake@test.com',
      bio: 'Surfer 🏄 | Model | Living the beach life',
      avatarUrl: 'https://i.pravatar.cc/300?img=33',
      bannerUrl: 'https://picsum.photos/1200/400?random=2',
    },
    {
      handle: 'gym_bro_jay',
      displayName: 'Jay Fitness',
      email: 'jay@test.com',
      bio: 'Personal trainer | Workout tips | Lifestyle content',
      avatarUrl: 'https://i.pravatar.cc/300?img=52',
      bannerUrl: 'https://picsum.photos/1200/400?random=3',
    },
    {
      handle: 'model_marco',
      displayName: 'Marco',
      email: 'marco@test.com',
      bio: 'Professional model | Fashion & lifestyle',
      avatarUrl: 'https://i.pravatar.cc/300?img=68',
      bannerUrl: 'https://picsum.photos/1200/400?random=4',
    },
  ];

  const createdCreators = [];

  for (const creator of testCreators) {
    // Check if profile exists
    const existing = await db.execute(sql`
      SELECT id FROM profiles WHERE handle = ${creator.handle}
    `);

    let profileId;
    if (existing.rows.length > 0) {
      console.log(`✓ User ${creator.handle} already exists`);
      profileId = existing.rows[0].id;
    } else {
      // Step 1: Create account
      const accountResult = await db.execute(sql`
        INSERT INTO accounts (email, email_verified, status)
        VALUES (${creator.email}, true, 'active')
        RETURNING id
      `);
      const accountId = accountResult.rows[0].id;

      // Step 2: Create profile
      const profileResult = await db.execute(sql`
        INSERT INTO profiles (
          account_id, handle, display_name, bio, type,
          avatar_url, banner_url, age_verified
        )
        VALUES (
          ${accountId}, ${creator.handle}, ${creator.displayName}, ${creator.bio}, 'creator',
          ${creator.avatarUrl}, ${creator.bannerUrl}, true
        )
        RETURNING id
      `);
      profileId = profileResult.rows[0].id;

      // Step 3: Create creator profile
      await db.execute(sql`
        INSERT INTO creator_profiles (
          user_id, monthly_price_cents, categories, total_subscribers,
          is_verified, is_online
        )
        VALUES (
          ${profileId}, 999, ARRAY['fitness', 'lifestyle', 'modeling']::text[],
          ${Math.floor(Math.random() * 1000) + 100}, true, false
        )
      `);

      console.log(`✓ Created user: ${creator.handle}`);
    }

    createdCreators.push({ id: profileId, handle: creator.handle });
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
    {
      type: 'photo',
      title: 'Meal prep Sunday',
      content: 'Prepping meals for the week! Clean eating = better results 🥗',
      mediaUrls: ['https://picsum.photos/800/600?random=15'],
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
          ${JSON.stringify(template.mediaUrls || [])}::text[],
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

    console.log(`✓ Created ${numPosts} posts for: ${creator.handle}`);
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
    console.error(error.cause || error);
    process.exit(1);
  });
