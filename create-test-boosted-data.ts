#!/usr/bin/env tsx
// Load environment variables first
import './server/env';

import { db } from './server/db';
import { accounts, profiles, users, referralRelationships, posts } from './shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

async function createTestData() {
  console.log('🚀 Creating test data for boosted posts carousel...\n');

  try {
    // Create 3 test creator accounts
    const testCreators: Array<{ accountId: string; userId: string; handle: string }> = [];

    for (let i = 1; i <= 3; i++) {
      const handle = `boosted_creator_${i}`;
      const email = `boosted${i}@test.com`;
      const username = `boosted_creator_${i}`;

      // Check if account already exists
      const existingAccount = await db.select()
        .from(accounts)
        .where(eq(accounts.email, email))
        .limit(1);

      let accountId: string;
      let userId: string;

      if (existingAccount.length > 0) {
        accountId = existingAccount[0].id;
        console.log(`✓ Account ${i} already exists: ${email}`);

        // Get existing profile
        const [existingProfile] = await db.select()
          .from(profiles)
          .where(eq(profiles.accountId, accountId))
          .limit(1);

        // Get existing user
        const [existingUser] = await db.select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        userId = existingUser?.id || '';
      } else {
        // Create account
        const hashedPassword = await bcrypt.hash('test123', 10);
        const [newAccount] = await db.insert(accounts).values({
          email,
          passwordHash: hashedPassword,
          status: 'active',
          emailVerified: true,
        }).returning();

        accountId = newAccount.id;
        console.log(`✓ Created account ${i}: ${email} (ID: ${accountId})`);

        // Create profile linked to account
        await db.insert(profiles).values({
          accountId,
          handle,
          displayName: `Boosted Creator ${i}`,
          type: 'creator',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${i}`,
        });
        console.log(`✓ Created profile ${i}: ${handle}`);

        // Create user for posts compatibility (check if exists first)
        const existingUserByUsername = await db.select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (existingUserByUsername.length > 0) {
          userId = existingUserByUsername[0].id;
          console.log(`✓ User already exists: ${username}`);
        } else {
          const [newUser] = await db.insert(users).values({
            username,
            email,
            password: hashedPassword,
            role: 'creator',
            status: 'active',
            profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${i}`,
          }).returning();

          userId = newUser.id;
          console.log(`✓ Created user ${i}: ${username} (ID: ${userId})`);
        }
      }

      testCreators.push({ accountId, userId, handle });
    }

    // Create fan accounts to act as referees (3+ referrals per creator)
    console.log('\n📊 Creating referral relationships...');

    for (const creator of testCreators) {
      // Check existing referral count
      const existingReferrals = await db.select()
        .from(referralRelationships)
        .where(eq(referralRelationships.referrerId, creator.accountId));

      const needed = 3 - existingReferrals.length;

      if (needed <= 0) {
        console.log(`✓ ${creator.handle} already has ${existingReferrals.length} referrals`);
        continue;
      }

      // Create fan accounts and referral relationships
      for (let j = 1; j <= needed; j++) {
        const fanEmail = `fan_${creator.handle}_${j}@test.com`;
        const fanHandle = `fan_${creator.handle}_${j}`;

        // Check if fan account exists
        const existingFan = await db.select()
          .from(accounts)
          .where(eq(accounts.email, fanEmail))
          .limit(1);

        let fanAccountId: string;
        if (existingFan.length > 0) {
          fanAccountId = existingFan[0].id;
        } else {
          const hashedPassword = await bcrypt.hash('test123', 10);
          const [newFanAccount] = await db.insert(accounts).values({
            email: fanEmail,
            passwordHash: hashedPassword,
            status: 'active',
            emailVerified: true,
          }).returning();

          fanAccountId = newFanAccount.id;

          // Create fan profile
          await db.insert(profiles).values({
            accountId: fanAccountId,
            handle: fanHandle,
            displayName: `Fan ${j} of ${creator.handle}`,
            type: 'fan',
          });
        }

        // Create referral relationship
        await db.insert(referralRelationships).values({
          referrerId: creator.accountId,
          refereeId: fanAccountId,
          type: 'direct',
          level: 1,
          status: 'active',
          fraudScore: 0.0,
        }).onConflictDoNothing();
      }

      console.log(`✓ ${creator.handle} now has 3+ referrals`);
    }

    // Create explicit posts for each creator
    console.log('\n📸 Creating explicit posts...');

    const sampleImages = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    ];

    for (let i = 0; i < testCreators.length; i++) {
      const creator = testCreators[i];

      // Create 2 posts per creator
      for (let p = 1; p <= 2; p++) {
        await db.insert(posts).values({
          creatorId: creator.userId,
          caption: `Hot explicit content ${p} from ${creator.handle} 🔥`,
          type: 'photo',
          mediaUrls: [sampleImages[i % sampleImages.length]],
          thumbnailUrl: sampleImages[i % sampleImages.length],
          visibility: 'free',
          contentWarnings: ['explicit'],
          isExplicit: true,
          isProcessing: false,
          likesCount: Math.floor(Math.random() * 500) + 100,
          viewsCount: Math.floor(Math.random() * 2000) + 500,
          commentsCount: Math.floor(Math.random() * 50),
        });
      }

      console.log(`✓ Created 2 explicit posts for ${creator.handle}`);
    }

    console.log('\n✅ Test data creation complete!');
    console.log('\n📋 Summary:');
    console.log(`   - ${testCreators.length} creators with 3+ referrals`);
    console.log(`   - ${testCreators.length * 2} explicit posts`);
    console.log(`   - All posts are free/public visibility`);
    console.log('\n💡 The boosted posts carousel should now display these posts!');
    console.log('\n🌐 Visit http://localhost:3202 and collapse the sidebar to see the carousel');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createTestData();
