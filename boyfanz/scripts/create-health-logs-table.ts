/**
 * PROPRIETARY – Owned by Joshua Stone (Wyatt Cole).
 * Licensed for Use by FANZ Group Holdings LLC.
 * 30 N Gould Street, Sheridan, WY 82801.
 * ™ FANZ — Patent Pending (2025).
 */

// Create system_health_logs table for tracking bot results
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createHealthLogsTable() {
  console.log('📊 Creating system_health_logs table...');

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS system_health_logs (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        bot_results JSONB NOT NULL,
        total_issues INTEGER DEFAULT 0,
        total_fixes INTEGER DEFAULT 0,
        total_recommendations INTEGER DEFAULT 0,
        execution_duration_ms INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes separately (PostgreSQL syntax)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_health_logs_platform ON system_health_logs (platform)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_health_logs_created_at ON system_health_logs (created_at)
    `);

    console.log('✓ Created system_health_logs table');

    // Verify table creation
    const verify = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'system_health_logs'
      ORDER BY ordinal_position
    `);

    console.log('\n✓ Table structure verified:');
    verify.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n✅ System health logs table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create health logs table:', error);
    process.exit(1);
  }
}

createHealthLogsTable();
