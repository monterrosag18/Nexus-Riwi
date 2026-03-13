import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data: territories, error } = await supabase
        .from('territories')
        .select('*');
      
      if (error) throw error;
      return res.status(200).json(territories);
    }
    
    if (req.method === 'POST') {
      const { id, clanId, username } = req.body;
      if (!id || !clanId) return res.status(400).json({ message: 'Missing fields' });

      // 1. Get current territory state to identify previous owner
      const { data: oldTerr, error: fetchError } = await supabase
        .from('territories')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      const prevOwner = oldTerr ? oldTerr.owner_id : 'neutral';

      // 2. Update owner
      const { error: updateError } = await supabase
        .from('territories')
        .update({ owner_id: clanId })
        .eq('id', id);

      if (updateError) throw updateError;

      // 3. Increment Points (Server-Side)
      // A. Increment New Clan (+100)
      await supabase.rpc('increment_clan_points', { clan_id_v: clanId, amount_v: 100 });

      // B. Increment User (+100)
      if (username) {
        await supabase
          .from('users')
          .update({ points: (await supabase.from('users').select('points').eq('username', username).single()).data.points + 100 })
          .eq('username', username);
      }

      // C. Decrement Old Clan (-50) if it wasn't neutral
      if (prevOwner && prevOwner !== 'neutral' && prevOwner !== clanId) {
        await supabase.rpc('increment_clan_points', { clan_id_v: prevOwner, amount_v: -50 });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Territories API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
