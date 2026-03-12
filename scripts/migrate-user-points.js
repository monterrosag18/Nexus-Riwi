require('dotenv').config({ path: '.env.local' });
const { db } = require('@vercel/postgres');

async function migrate() {
  const client = await db.connect();
  try {
    console.log('Adding points column to users table...');
    await client.sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;`;
    console.log('Column added successfully.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await client.end();
  }
}

migrate();
