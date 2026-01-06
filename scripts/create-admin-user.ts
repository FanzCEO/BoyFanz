import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createAdminUser() {
  console.log('👑 Creating admin user...');

  const email = 'wyatt@wyattxxxcole.com';
  const username = 'wyatt';

  try {
    // Check if user already exists
    const existing = await db.execute(sql`
      SELECT id, email FROM users WHERE email = ${email}
    `);

    if (existing.rows.length > 0) {
      console.log('✓ User already exists:', email);
      console.log('User ID:', existing.rows[0].id);
      process.exit(0);
    }

    // Create the admin user
    const result = await db.execute(sql`
      INSERT INTO users (
        username, email, display_name,
        is_verified, email_verified, created_at
      )
      VALUES (
        ${username},
        ${email},
        'Wyatt Cole',
        true,
        true,
        NOW()
      )
      RETURNING id
    `);

    console.log('✅ Created admin user:', email);
    console.log('User ID:', result.rows[0].id);
    console.log('\n✅ You can now log in with SSO using', email);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

createAdminUser();
