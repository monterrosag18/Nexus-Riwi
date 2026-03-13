import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { clanId } = req.query;
  if (!clanId) return res.status(400).json({ message: 'Missing clanId' });

  try {
    // Fetch users for the given clan
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('username, clan_id, points')
      .eq('clan_id', clanId)
      .order('points', { ascending: false });

    if (error) throw error;
    
    // Map to expected format if needed
    const members = users.map(u => ({
      name: u.username,
      clan: u.clan_id,
      points: u.points
    }));
    
    return res.status(200).json(members);
  } catch (error) {
    console.error('Fetch Clan Members API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
