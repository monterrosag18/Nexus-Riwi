import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const { key } = req.query;
  const SETUP_KEY = 'NEXUS_INIT_2024';

  if (key !== SETUP_KEY) {
    return res.status(401).json({ message: 'UNAUTHORIZED ACCESS' });
  }

  const client = await db.connect();

  try {
    // 1. Create Clans Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS clans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color CHAR(7) NOT NULL,
        points INTEGER DEFAULT 0,
        members_count INTEGER DEFAULT 0,
        icon VARCHAR(50)
      );
    `;

    // 2. Seed Clans
    const clans = [
      ['turing', 'Turing', '#2D9CDB', 2606, 25, 'f2db'],
      ['tesla', 'Tesla', '#EB5757', 1932, 28, 'f0e7'],
      ['mccarthy', 'McCarthy', '#27AE60', 1373, 22, 'f544'],
      ['thompson', 'Thompson', '#9B51E0', 1105, 18, 'f085'],
      ['halmiton', 'Hamilton', '#F2C94C', 940, 15, 'f06d']
    ];

    for (const clan of clans) {
      await client.sql`
        INSERT INTO clans (id, name, color, points, members_count, icon)
        VALUES (${clan[0]}, ${clan[1]}, ${clan[2]}, ${clan[3]}, ${clan[4]}, ${clan[5]})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 3. Create Users Table
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        clan_id VARCHAR(50) REFERENCES clans(id),
        credits INTEGER DEFAULT 2000,
        active_skin VARCHAR(50),
        active_chat_color CHAR(7),
        active_border_color CHAR(7),
        active_shield_color CHAR(7),
        owned_cosmetics JSONB DEFAULT '[]'::jsonb,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create Chat Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        clan_id VARCHAR(50) REFERENCES clans(id),
        user_username VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Create Territories Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS territories (
        id INTEGER PRIMARY KEY,
        owner_id VARCHAR(50) REFERENCES clans(id),
        type VARCHAR(20),
        biome VARCHAR(20),
        difficulty INTEGER,
        question JSONB
      );
    `;

    // Seed territories if empty
    const check = await client.sql`SELECT count(*) FROM territories;`;
    if (parseInt(check.rows[0].count) === 0) {
      const values = [];
      for (let i = 0; i < 100; i++) {
        let type = (i % 3 === 0) ? 'code' : ((i % 3 === 1) ? 'english' : 'soft-skills');
        let biome = type === 'code' ? 'city' : (type === 'english' ? 'library' : 'park');
        values.push(`(${i}, NULL, '${type}', '${biome}', ${Math.floor(Math.random() * 3) + 1})`);
      }
      await client.query(`INSERT INTO territories (id, owner_id, type, biome, difficulty) VALUES ${values.join(',')}`);
    }

    // 6. Create Questions Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20),
        difficulty INTEGER,
        q TEXT NOT NULL,
        options JSONB NOT NULL,
        correct INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Create Announcements Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        msg TEXT NOT NULL,
        type VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return res.status(200).json({ success: true, message: 'DATABASE INITIALIZED SUCCESSFULLY' });
  } catch (error) {
    console.error('Setup Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.end();
  }
}
