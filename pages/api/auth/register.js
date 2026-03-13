import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, clan, password } = req.body;
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

    // Insert user
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        username,
        password_hash: hashedPassword,
        clan_id: clan.toLowerCase(),
        credits: 2000,
        total_spins: 0,
        points: 0
      });

    if (insertError) throw insertError;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Registration API Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
