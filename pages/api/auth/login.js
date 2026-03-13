import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcrypt';
import { signToken } from '../../../lib/auth';
import rateLimit from '../../../lib/rateLimit';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!rateLimit(ip, 10, 60000)) {
    return res.status(429).json({ message: 'TOO MANY ATTEMPTS. NEURAL LINK THROTTLED.' });
  }

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

    // Create secure session ID
    const sessionId = Math.random().toString(36).substring(2, 12);

    // Update session in DB
    await supabase.from('users').update({ last_session_id: sessionId }).eq('id', user.id);

    // Create token with modular auth
    const token = signToken({ id: user.id, username: user.username, clan: user.clan_id, sessionId });

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
