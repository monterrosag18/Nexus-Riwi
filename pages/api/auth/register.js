import { db } from '@vercel/postgres';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  const client = await db.connect();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, clan, password } = req.body;
    if (!username || !clan || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Check if user exists
    const userCheck = await client.sql`SELECT id FROM users WHERE username = ${username} LIMIT 1;`;
    if (userCheck.rowCount > 0) {
      return res.status(400).json({ message: 'CODENAME ALREADY TAKEN' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    await client.sql`
      INSERT INTO users (username, password_hash, clan_id, credits)
      VALUES (${username}, ${hashedPassword}, ${clan}, 2000);
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Registration API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    await client.end();
  }
}
