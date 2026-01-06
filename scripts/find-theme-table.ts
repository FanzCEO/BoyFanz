// Find where themes are stored
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function findThemeTable() {
  console.log('🔍 Searching for theme-related tables...\n');

  try {
    // Find all tables with 'theme' in the name
    const tables = await db.execute(sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND (tablename LIKE '%theme%' OR tablename LIKE '%setting%' OR tablename LIKE '%config%')
      ORDER BY tablename
    `);

    console.log('Tables found:');
    tables.rows.forEach((row: any) => {
      console.log(`  - ${row.tablename}`);
    });

    // Check if there's a site_settings table
    const siteSettings = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'site_settings'
      ORDER BY ordinal_position
    `);

    if (siteSettings.rows.length > 0) {
      console.log('\n📊 site_settings columns:');
      siteSettings.rows.forEach((row: any) => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }

    // Check the actual API endpoint code
    console.log('\n🔍 Checking /api/themes/active endpoint...');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findThemeTable();
