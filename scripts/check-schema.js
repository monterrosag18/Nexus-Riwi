require('dotenv').config({ path: '.env.local' });
const { db } = require('@vercel/postgres');
async function check() {
  const client = await db.connect();
  try {
    const res = await client.sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`;
    console.log('Columns in users table:', res.rows.map(r => r.column_name));
  } catch (e) {
    console.error('Check failed:', e);
  } finally {
    await client.end();
  }
}
check();
