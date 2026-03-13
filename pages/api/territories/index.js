import { supabase, supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data: territories, error } = await supabaseAdmin
        .from('territories')
        .select('*');
      
      if (error) throw error;
      return res.status(200).json(territories);
    }
    
    if (req.method === 'POST') {
      const { id, clanId, username } = req.body;
      if (id === undefined || !clanId) return res.status(400).json({ message: 'Missing fields' });

      const targetId = parseInt(id);

      // ADJACENCY CHECK (SERVER-SIDE)
      const { data: myTerrs } = await supabaseAdmin
        .from('territories')
        .select('id')
        .eq('owner_id', clanId);

      const hasTerritories = myTerrs && myTerrs.length > 0;

      if (hasTerritories) {
        // Deterministic neighbor logic (axial coordinates)
        const getNeighbors = (tid) => {
          const ringSize = 12;
          const hexRadius = 8;
          const hexWidth = Math.sqrt(3) * hexRadius;
          const hexHeight = 2 * hexRadius;
          
          const allHexes = [];
          for (let q = -ringSize; q <= ringSize; q++) {
            for (let r = -ringSize; r <= ringSize; r++) {
              if (Math.abs(q + r) <= ringSize) {
                const x = hexWidth * (q + r / 2);
                const z = hexHeight * (3 / 4) * r;
                if (Math.sqrt(x * x + z * z) < 25) continue;
                allHexes.push({ q, r });
              }
            }
          }

          const target = allHexes[tid];
          if (!target) return [];

          const directions = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
          const neighbors = [];
          
          directions.forEach(([dq, dr]) => {
            const nq = target.q + dq;
            const nr = target.r + dr;
            const nIndex = allHexes.findIndex(h => h.q === nq && h.r === nr);
            if (nIndex !== -1) neighbors.push(nIndex);
          });
          return neighbors;
        };

        const neighbors = getNeighbors(targetId);
        const myIds = myTerrs.map(t => parseInt(t.id));
        const isAdjacent = neighbors.some(nId => myIds.includes(nId));

        if (!isAdjacent) {
          return res.status(400).json({ message: 'SECTOR OUT OF RANGE: ADJACENCY REQUIRED' });
        }
      }

      // 1. Get current territory state (ADMIN)
      const { data: oldTerr, error: fetchError } = await supabaseAdmin
        .from('territories')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      const prevOwner = oldTerr ? oldTerr.owner_id : 'neutral';

      // 2. Update owner (ADMIN)
      const { error: updateError } = await supabaseAdmin
        .from('territories')
        .update({ owner_id: clanId })
        .eq('id', id);

      if (updateError) throw updateError;

      // 3. Increment Points (ADMIN)
      // A. Increment New Clan (+100)
      const { data: clanData } = await supabaseAdmin.from('clans').select('points').eq('id', clanId).single();
      if (clanData) {
        await supabaseAdmin.from('clans').update({ points: (clanData.points || 0) + 100 }).eq('id', clanId);
      }

      // B. Increment User (+100)
      if (username) {
        const { data: userData } = await supabaseAdmin.from('users').select('points').eq('username', username).single();
        if (userData) {
          await supabaseAdmin.from('users').update({ points: (userData.points || 0) + 100 }).eq('username', username);
        }
      }

      // C. Decrement Old Clan (-50) if it wasn't neutral
      if (prevOwner && prevOwner !== 'neutral' && prevOwner !== clanId) {
        const { data: oldClanData } = await supabaseAdmin.from('clans').select('points').eq('id', prevOwner).single();
        if (oldClanData) {
          await supabaseAdmin.from('clans').update({ points: Math.max(0, (oldClanData.points || 0) - 50) }).eq('id', prevOwner);
        }
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Territories API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
