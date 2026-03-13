require('dotenv').config({ path: '.env.local' });
const { db } = require('@vercel/postgres');

async function audit() {
  const client = await db.connect();
  try {
    console.log('--- NEXUS SYSTEM AUDIT ---');
    
    const clans = await client.sql`SELECT * FROM clans;`;
    console.log(`Clans found: ${clans.rows.length}`);
    clans.rows.forEach(c => console.log(` - [${c.id}] ${c.name}: ${c.points} pts, ${c.members_count} members`));

    const users = await client.sql`SELECT username, clan_id, credits, points FROM users;`;
    console.log(`Users found: ${users.rows.length}`);
    users.rows.slice(0, 5).forEach(u => console.log(` - ${u.username} (${u.clan_id || 'N/A'}): ${u.credits} creds, ${u.points} pts`));

    const territories = await client.sql`SELECT count(*) FROM territories;`;
    const ownedTerritories = await client.sql`SELECT count(*) FROM territories WHERE owner_id IS NOT NULL;`;
    console.log(`Territories: Total=${territories.rows[0].count}, Owned=${ownedTerritories.rows[0].count}`);

    const questions = await client.sql`SELECT count(*) FROM questions;`;
    console.log(`Questions in bank: ${questions.rows[0].count}`);

    const news = await client.sql`SELECT count(*) FROM announcements;`;
    console.log(`Active news broadcasts: ${news.rows[0].count}`);

  } catch (e) {
    console.error('Audit failed:', e);
  } finally {
    await client.end();
  }
}

audit();
