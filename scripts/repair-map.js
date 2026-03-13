require('dotenv').config({ path: '.env.local' });
const { db } = require('@vercel/postgres');

async function repair() {
  const client = await db.connect();
  try {
    console.log('--- TERRITORY REPAIR SYSTEM ---');
    
    // 1. Check current count
    const check = await client.sql`SELECT count(*) FROM territories;`;
    const count = parseInt(check.rows[0].count);
    console.log(`Current territories: ${count}`);

    const target = 150;
    if (count < target) {
      console.log(`Injecting ${target - count} missing hexes...`);
      const values = [];
      for (let i = count; i < target; i++) {
        let type = 'code';
        const r = Math.random();
        if (r > 0.6) type = 'code';
        else if (r > 0.3) type = 'english';
        else type = 'soft-skills';
        let biome = type === 'code' ? 'city' : (type === 'english' ? 'library' : 'park');
        values.push(`(${i}, NULL, '${type}', '${biome}', ${Math.floor(Math.random() * 3) + 1})`);
      }
      
      await client.query(`
        INSERT INTO territories (id, owner_id, type, biome, difficulty)
        VALUES ${values.join(',')}
      `);
      console.log('Repair complete. Map grid restored.');
    } else {
      console.log('No repair needed. Table has enough hexes.');
    }

  } catch (e) {
    console.error('Repair failed:', e);
  } finally {
    await client.end();
  }
}

repair();
