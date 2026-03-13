import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'CODENAME NOT FOUND' });
    }

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
    console.error('Login API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
