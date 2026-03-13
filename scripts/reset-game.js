require('dotenv').config({ path: '.env.local' });
const { db } = require('@vercel/postgres');

async function resetGame() {
  const client = await db.connect();
  try {
    console.log('--- CRITICAL: SYSTEM RESET INITIATED ---');

    // 1. Reset all Clan points to 0
    console.log('Resetting clan points...');
    await client.sql`UPDATE clans SET points = 0;`;

    // 2. Reset all User points and credits (start credits at 2000)
    console.log('Resetting user stats...');
    await client.sql`UPDATE users SET points = 0, credits = 2000;`;

    // 3. Reset all Territories to Neutral (owner_id = NULL)
    console.log('Resetting all territories to neutral...');
    await client.sql`UPDATE territories SET owner_id = NULL;`;

    // 4. Clear chat messages (optional but cleaner)
    console.log('Clearing global chat...');
    await client.sql`DELETE FROM chat_messages;`;

    // 5. Clear old announcements
    console.log('Clearing old news broadcasts...');
    await client.sql`DELETE FROM announcements;`;

    console.log('--- RESET COMPLETE: NEXUS IS NOW VIRGIN STATE ---');

  } catch (e) {
    console.error('Reset failed:', e);
  } finally {
    await client.end();
  }
}

resetGame();
