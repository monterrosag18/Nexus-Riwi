import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

  const adminToken = req.headers['x-admin-token'];
  const decoded = verifyToken(adminToken);
  if (!decoded || decoded.role !== 'SUPER_USER') {
    console.warn('[Security] Unauthorized Reset-Map blocked.');
    return res.status(403).json({ message: 'ADMIN_AUTH_REQUIRED' });
  }

    try {
        console.log('[AdminAPI] Starting Global Map Reset (Fixed Sequence)...');

        const clans = [
            { id: 'turing', name: 'Turing', color: '#2D9CDB', points: 50, icon: '3d_atom' },
            { id: 'tesla', name: 'Tesla', color: '#EB5757', points: 50, icon: '3d_bolt' },
            { id: 'mccarthy', name: 'McCarthy', color: '#27AE60', points: 50, icon: '3d_gem' },
            { id: 'thompson', name: 'Thompson', color: '#9B51E0', points: 50, icon: '3d_shield' },
            { id: 'hamilton', name: 'Hamilton', color: '#F2C94C', points: 50, icon: '3d_pyramid' }
        ];

        // 1. ENSURE CLANS EXIST (Seed/Upsert) - Crucial to avoid FK violations
        console.log('[AdminAPI] Seeding official clans...');
        const { error: seedClanError } = await supabaseAdmin
            .from('clans')
            .upsert(clans);
        
        if (seedClanError) throw seedClanError;

        // 2. Clear Territories
        console.log('[AdminAPI] Clearing old territories...');
        const { error: terrError } = await supabaseAdmin
            .from('territories')
            .delete()
            .neq('id', -1); 

        if (terrError) throw terrError;

        // 3. Repopulate with 130 Sectors + Home Bases
        console.log('[AdminAPI] Generating map grid with Home Bases...');
        
        const clanIds = clans.map(c => c.id);
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
                    allHexes.push({ x, z, q, r });
                }
            }
        }

        const bannerRadius = 170; 
        const startingIndices = clanIds.map((clanId, index) => {
            const angle = (360 / clanIds.length) * index;
            const rad = (angle * Math.PI) / 180;
            const targetX = Math.cos(rad) * bannerRadius;
            const targetZ = Math.sin(rad) * bannerRadius;

            let closestIdx = -1;
            let minDist = Infinity;
            allHexes.forEach((hex, i) => {
                const d = Math.sqrt((hex.x - targetX)**2 + (hex.z - targetZ)**2);
                if (d < minDist) {
                    minDist = d;
                    closestIdx = i;
                }
            });
            return { clanId, hexIdx: closestIdx };
        });

        const newTerritories = allHexes.map((hex, i) => {
            const homeBase = startingIndices.find(sb => sb.hexIdx === i);
            let type = 'code';
            const rnd = Math.random();
            if (rnd > 0.6) type = 'code';
            else if (rnd > 0.3) type = 'english';
            else type = 'soft-skills';

            return {
                id: i,
                owner_id: homeBase ? homeBase.clanId : null,
                type: type,
                biome: type === 'code' ? 'city' : (type === 'english' ? 'library' : 'park'),
                difficulty: homeBase ? 1 : (Math.floor(Math.random() * 3) + 1)
            };
        });

        const { error: insertError } = await supabaseAdmin
            .from('territories')
            .insert(newTerritories);

        if (insertError) throw insertError;

        // 4. Reset User Points
        console.log('[AdminAPI] Resetting User points...');
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({ points: 0 })
            .neq('points', -1); 

        if (userError) throw userError;

        // 5. Post Announcement
        await supabaseAdmin.from('chat_messages').insert([{
            clan_id: 'SYSTEM',
            user_username: 'ADMIN',
            content: '⚠️ NEXUS NORMALIZED: Season reset complete. Security protocol active.'
        }]);

        console.log('[AdminAPI] Global Reset Complete.');
        return res.status(200).json({ success: true, message: 'Map and points reset successfully' });

    } catch (error) {
        console.error('[AdminAPI] Reset Failed:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
