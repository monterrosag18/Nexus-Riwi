import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const result = await sql`
      SELECT * FROM users WHERE username = ${username} LIMIT 1;
    `;

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'CODENAME NOT FOUND' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'INVALID SECURITY KEY' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, clan: user.clan_id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ 
      success: true, 
      user: {
        name: user.username,
        clan: user.clan_id,
        credits: user.credits,
        active_skin: user.active_skin,
        owned_cosmetics: user.owned_cosmetics || []
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
