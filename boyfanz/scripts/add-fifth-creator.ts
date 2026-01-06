import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function addFifthCreator() {
  console.log('🎨 Adding 5th test creator...');

  const username = 'fitness_frank';
  const email = 'fitness.frank@test.fanz';
  const password = await bcrypt.hash('Test1234!', 10);

  try {
    // Check if creator already exists
    const existing = await db.execute(sql`
      SELECT id FROM users WHERE username = ${username}
    `);

    if (existing.rows.length > 0) {
      console.log('✓ Creator already exists:', username);
      return;
    }

    // Create the creator
    await db.execute(sql`
      INSERT INTO users (
        username, email, display_name,
        is_creator, is_verified, email_verified, created_at
      )
      VALUES (
        ${username},
        ${email},
        'Fitness Frank',
        true,
        true,
        true,
        NOW()
      )
    `);

    console.log('✅ Created new creator: @' + username);

    // Verify total count
    const count = await db.execute(sql`
      SELECT COUNT(*) as count FROM users WHERE is_creator = true
    `);

    console.log(`\n✅ Total creators: ${count.rows[0].count}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

addFifthCreator();
