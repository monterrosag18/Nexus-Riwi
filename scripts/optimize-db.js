require('dotenv').config({ path: '.env.local' });
const { db } = require('@vercel/postgres');

async function optimize() {
  const client = await db.connect();
  try {
    console.log('--- NEXUS DATABASE OPTIMIZATION ---');
    
    // 1. Users table: Index on clan_id for fast leaderboard/member lookups
    console.log('Optimizing users table...');
    await client.sql`CREATE INDEX IF NOT EXISTS idx_users_clan_id ON users (clan_id);`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_users_points ON users (points DESC);`;

    // 2. Territories table: Index on owner_id for map state queries
    console.log('Optimizing territories table...');
    await client.sql`CREATE INDEX IF NOT EXISTS idx_territories_owner_id ON territories (owner_id);`;

    // 3. Chat Messages: Fast history lookup per clan
    console.log('Optimizing chat_messages table...');
    await client.sql`CREATE INDEX IF NOT EXISTS idx_chat_clan_id ON chat_messages (clan_id);`;
    await client.sql`CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages (created_at DESC);`;

    // 4. Questions: Optimized selection by type and difficulty
    console.log('Optimizing questions table...');
    await client.sql`CREATE INDEX IF NOT EXISTS idx_questions_type_diff ON questions (type, difficulty);`;

    // 5. Clans: Ordered points index
    console.log('Optimizing clans table...');
    await client.sql`CREATE INDEX IF NOT EXISTS idx_clans_points ON clans (points DESC);`;

    console.log('Optimization complete. Indexes synchronized.');

  } catch (e) {
    console.error('Optimization failed:', e);
  } finally {
    await client.end();
  }
}

optimize();
