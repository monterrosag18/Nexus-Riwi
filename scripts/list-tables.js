require('dotenv').config({ path: '.env.local' });
const { db } = require('@vercel/postgres');

async function listTables() {
  const client = await db.connect();
  try {
    const res = await client.sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables currently in Vercel DB:', res.rows.map(r => r.table_name));
  } catch (e) {
    console.error('Failed to list tables:', e);
  } finally {
    await client.end();
  }
}

listTables();
