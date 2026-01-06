import 'dotenv/config';
import pg from 'pg';

console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'Found (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT FOUND');

if (process.env.DATABASE_URL) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('✅ Database connection successful');
    await client.end();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Code:', err.code);
  }
}
