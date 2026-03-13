import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Fetch clans with member count from users table using Admin client to bypass RLS
      const { data: clans, error } = await supabaseAdmin
        .from('clans')
        .select(`
          *,
          users(id)
        `)
        .order('points', { ascending: false });

      if (error) throw error;

      const clansMap = {};
      clans.forEach(clan => {
        clansMap[clan.id] = {
          id: clan.id,
          name: clan.name,
          color: clan.color,
          points: clan.points,
          members: clan.users ? clan.users.length : 0,
          icon: clan.icon
        };
      });
      return res.status(200).json(clansMap);
    }

    if (req.method === 'POST') {
      const { id, name, color, icon, points, members } = req.body;
      if (!id || !name || !color) return res.status(400).json({ message: 'Missing fields' });

      const { error } = await supabase
        .from('clans')
        .upsert({ id, name, color, icon, points: points || 0, members_count: members || 0 });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Missing id' });

      const { error } = await supabase
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
