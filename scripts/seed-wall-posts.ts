// Seed test posts using existing wall_posts table
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function seedWallPosts() {
  console.log('🌱 Seeding wall posts...');

  // Get the test creators we created
  const creators = await db.execute(sql`
    SELECT id, handle, display_name
    FROM profiles
    WHERE handle IN ('alpha_muscle', 'beach_boy_blake', 'gym_bro_jay', 'model_marco')
  `);

  if (creators.rows.length === 0) {
    console.log('❌ No test creators found. Run seed-feed-final.ts first.');
    process.exit(1);
  }

  console.log(`Found ${creators.rows.length} creators`);

  // Post templates
  const postTemplates = [
    {
      type: 'photo',
      content: 'Starting the day right with some heavy lifting! Who else hit the gym this morning? 💪 #fitness #motivation',
      mediaUrls: ['https://picsum.photos/800/1000?random=10'],
    },
    {
      type: 'photo',
      content: 'Perfect weather for a beach day! Living my best life 😎 🌊',
      mediaUrls: ['https://picsum.photos/800/1000?random=11'],
    },
    {
      type: 'photo',
      content: 'Had an amazing photoshoot today! More content coming soon 📸',
      mediaUrls: ['https://picsum.photos/800/1000?random=13', 'https://picsum.photos/800/1000?random=14'],
    },
    {
      type: 'text',
      content: 'Remember: The only bad workout is the one that didn\'t happen. Get out there and crush your goals! 💯\n\nWhat are you working on this week?',
      mediaUrls: [],
    },
    {
      type: 'photo',
      content: 'Meal prep Sunday! Clean eating = better results 🥗',
      mediaUrls: ['https://picsum.photos/800/600?random=15'],
    },
    {
      type: 'photo',
      content: 'Leg day complete! Never skip leg day! 🦵',
      mediaUrls: ['https://picsum.photos/800/1000?random=16'],
    },
  ];

  let totalPostsCreated = 0;

  for (const creator of creators.rows) {
    // Create 3-5 posts per creator
    const numPosts = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numPosts; i++) {
      const template = postTemplates[Math.floor(Math.random() * postTemplates.length)];

      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 48));

      await db.execute(sql`
        INSERT INTO wall_posts (
          profile_user_id, author_id, type, content, media_urls,
          comments_count, created_at
        )
        VALUES (
          ${creator.id}, ${creator.id}, ${template.type}, ${template.content},
          ${JSON.stringify(template.mediaUrls)}::jsonb,
          0, ${createdAt.toISOString()}
        )
      `);

      totalPostsCreated++;
    }

    console.log(`✓ Created ${numPosts} wall posts for: ${creator.handle}`);
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`📝 Created ${totalPostsCreated} wall posts`);
  console.log(`\n🎉 Wall posts created successfully!`);
}

seedWallPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    console.error(error.cause || error);
    process.exit(1);
  });
