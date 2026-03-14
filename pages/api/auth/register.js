import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcrypt';
import rateLimit from '../../../lib/rateLimit';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!rateLimit(ip, 5, 60000)) {
    return res.status(429).json({ message: 'TOO MANY ATTEMPTS. COOL DOWN, HACKER.' });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, clan, password } = req.body;
    
    // VALIDATION SHIELD
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: 'INVALID CODENAME: 3-15 ALPHANUMERIC CHARS ONLY' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'WEAK SECURITY KEY: MINIMUM 8 CHARACTERS REQUIRED' });
    }

    if (!username || !clan || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'CODENAME ALREADY TAKEN' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const targetClan = clan.toLowerCase();

    // Insert user
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        username,
        password_hash: hashedPassword,
        clan_id: targetClan,
        credits: 2000,
        total_spins: 0,
        points: 0
      });

    if (insertError) {
      console.error('[Registration] Database Error:', insertError);
      if (insertError.code === '23503') {
        return res.status(400).json({ message: 'FACTION REJECTED: INVALID CLAN ID' });
      }
      throw insertError;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Registration API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
