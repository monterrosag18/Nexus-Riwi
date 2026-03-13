import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Simple Security Shield: Protect mutations
  if (req.method !== 'GET') {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken.length < 20) {
      console.warn('[Security] Unauthorized clan mutation blocked.');
      return res.status(403).json({ message: 'AUTH_REQUIRED' });
    }
  }

  try {
    if (req.method === 'GET') {
      try {
        // 1. Fetch all clans
        const { data: clans, error: clanError } = await supabaseAdmin
          .from('clans')
          .select('*')
          .order('points', { ascending: false });

        if (clanError) throw clanError;

        // 2. Fetch member counts (distinct counts from profiles table)
        // We do this separately to avoid "relationship not found" schema errors
        const { data: memberCounts, error: memberError } = await supabaseAdmin
          .from('profiles')
          .select('clan_id');

        if (memberError) {
            console.warn('[ClansAPI] Member fetch fail (continuing with 0):', memberError.message);
        }

        // Count members per clan
        const counts = {};
        if (memberCounts) {
            memberCounts.forEach(p => {
                if (p.clan_id) counts[p.clan_id] = (counts[p.clan_id] || 0) + 1;
            });
        }

        const clansMap = {};
        clans.forEach(clan => {
          clansMap[clan.id] = {
            id: clan.id,
            name: clan.name,
            color: clan.color,
            points: clan.points,
            members: counts[clan.id] || 0,
            icon: clan.icon
          };
        });
        return res.status(200).json(clansMap);
      } catch (err) {
        console.error('[ClansAPI] GET handler failure:', err);
        return res.status(500).json({ message: 'Error fetching clans', details: err.message });
      }
    }

    if (req.method === 'POST') {
      const { id, name, color, icon, points, members } = req.body;
      if (!id || !name || !color) return res.status(400).json({ message: 'Missing fields' });

      const { error } = await supabaseAdmin
        .from('clans')
        .upsert({ id, name, color, icon, points: points || 0, members_count: members || 0 });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Missing id' });

      const { error } = await supabaseAdmin
        .from('clans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Clans API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
