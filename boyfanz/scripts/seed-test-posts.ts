// Script to add test posts to the feed
import { db } from '../server/db';
import { users, creatorProfiles, posts } from '../shared/schema';
import { eq } from 'drizzle-orm';

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
      bannerImageUrl: 'https://picsum.photos/1200/400?random=1',
    },
    {
      username: 'beach_boy_blake',
      displayName: 'Beach Boy Blake',
      email: 'blake@test.com',
      bio: 'Surfer 🏄 | Model | Living the beach life',
      profileImageUrl: 'https://i.pravatar.cc/300?img=33',
      bannerImageUrl: 'https://picsum.photos/1200/400?random=2',
    },
    {
      username: 'gym_bro_jay',
      displayName: 'Jay Fitness',
      email: 'jay@test.com',
      bio: 'Personal trainer | Workout tips | Lifestyle content',
      profileImageUrl: 'https://i.pravatar.cc/300?img=52',
      bannerImageUrl: 'https://picsum.photos/1200/400?random=3',
    },
    {
      username: 'model_marco',
      displayName: 'Marco',
      email: 'marco@test.com',
      bio: 'Professional model | Fashion & lifestyle',
      profileImageUrl: 'https://i.pravatar.cc/300?img=68',
      bannerImageUrl: 'https://picsum.photos/1200/400?random=4',
    },
  ];

  const createdCreators = [];

  for (const creator of testCreators) {
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, creator.username))
      .limit(1);

    let user;
    if (existingUser) {
      console.log(`✓ User ${creator.username} already exists`);
      user = existingUser;
    } else {
      [user] = await db
        .insert(users)
        .values({
          username: creator.username,
          displayName: creator.displayName,
          email: creator.email,
          bio: creator.bio,
          profileImageUrl: creator.profileImageUrl,
          avatarUrl: creator.profileImageUrl,
          isCreator: true,
          isVerified: true,
          isAgeVerified: true,
          emailVerified: true,
        })
        .returning();
      console.log(`✓ Created user: ${creator.username}`);
    }

    // Create or update creator profile
    const [existingProfile] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, user.id))
      .limit(1);

    if (!existingProfile) {
      await db.insert(creatorProfiles).values({
        userId: user.id,
        monthlyPriceCents: 999, // $9.99/month
        categories: ['fitness', 'lifestyle', 'modeling'],
        totalSubscribers: Math.floor(Math.random() * 1000) + 100,
        totalPosts: 0,
      });
      console.log(`✓ Created creator profile for: ${creator.username}`);
    }

    createdCreators.push(user);
  }

  // Create test posts for each creator
  const postTemplates = [
    {
      type: 'photo' as const,
      title: 'Morning workout session 💪',
      content: 'Starting the day right with some heavy lifting! Who else hit the gym this morning? #fitness #motivation',
      mediaUrls: ['https://picsum.photos/800/1000?random=10'],
      visibility: 'free' as const,
    },
    {
      type: 'photo' as const,
      title: 'Beach vibes 🌊',
      content: 'Perfect weather for a beach day! Living my best life 😎',
      mediaUrls: ['https://picsum.photos/800/1000?random=11'],
      visibility: 'free' as const,
    },
    {
      type: 'video' as const,
      title: 'New workout tutorial!',
      content: 'Check out this new exercise routine I put together. Perfect for building strength!',
      mediaUrls: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],
      thumbnailUrl: 'https://picsum.photos/800/600?random=12',
      visibility: 'subscribers' as const,
      priceCents: 0,
    },
    {
      type: 'photo' as const,
      title: 'Photoshoot behind the scenes',
      content: 'Had an amazing photoshoot today! More content coming soon 📸',
      mediaUrls: ['https://picsum.photos/800/1000?random=13', 'https://picsum.photos/800/1000?random=14'],
      visibility: 'free' as const,
    },
    {
      type: 'text' as const,
      title: 'Motivation Monday!',
      content: 'Remember: The only bad workout is the one that didn\'t happen. Get out there and crush your goals! 💯\n\nWhat are you working on this week?',
      visibility: 'free' as const,
    },
    {
      type: 'photo' as const,
      title: 'Meal prep Sunday',
      content: 'Prepping meals for the week! Clean eating = better results 🥗',
      mediaUrls: ['https://picsum.photos/800/600?random=15'],
      visibility: 'free' as const,
    },
    {
      type: 'photo' as const,
      title: 'Leg day complete! 🦵',
      content: 'Never skip leg day! Feeling the burn but worth it every time',
      mediaUrls: ['https://picsum.photos/800/1000?random=16'],
      visibility: 'free' as const,
    },
    {
      type: 'photo' as const,
      title: 'Golden hour 🌅',
      content: 'Caught the perfect sunset during today\'s outdoor workout',
      mediaUrls: ['https://picsum.photos/1000/800?random=17'],
      visibility: 'free' as const,
    },
  ];

  let totalPostsCreated = 0;

  for (const creator of createdCreators) {
    // Create 3-5 posts per creator
    const numPosts = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numPosts; i++) {
      const template = postTemplates[Math.floor(Math.random() * postTemplates.length)];

      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 48)); // Random time in last 48 hours

      await db.insert(posts).values({
        creatorId: creator.id,
        type: template.type,
        title: template.title,
        content: template.content,
        mediaUrls: template.mediaUrls || [],
        thumbnailUrl: template.thumbnailUrl,
        visibility: template.visibility,
        priceCents: template.priceCents || 0,
        isProcessing: false,
        likesCount: Math.floor(Math.random() * 100),
        commentsCount: Math.floor(Math.random() * 20),
        viewsCount: Math.floor(Math.random() * 500),
        createdAt,
      });

      totalPostsCreated++;
    }

    // Update creator's post count
    await db
      .update(creatorProfiles)
      .set({ totalPosts: numPosts })
      .where(eq(creatorProfiles.userId, creator.id));

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
