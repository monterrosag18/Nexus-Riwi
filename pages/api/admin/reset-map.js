
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken.length < 20) {
      console.warn('[Security] Unauthorized Reset-Map blocked.');
      return res.status(403).json({ message: 'AUTH_REQUIRED' });
    }

    try {
        console.log('[AdminAPI] Starting Global Map Reset...');

        // 1. Clear Territories
        const { error: terrError } = await supabaseAdmin
            .from('territories')
            .delete()
            .neq('id', -1); 

        if (terrError) throw terrError;

        // 1.5 Repopulate with 130 Sectors + Home Bases
        console.log('[AdminAPI] Generating map grid with Home Bases...');
        
        const clans = ['turing', 'tesla', 'mccarthy', 'thompson', 'hamilton'];
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
                    // Leave a void for the tower
                    if (Math.sqrt(x * x + z * z) < 25) continue;
                    allHexes.push({ x, z, q, r });
                }
            }
        }

        // Identify starting points
        const bannerRadius = 170; 
        const startingIndices = clans.map((clanId, index) => {
            const angle = (360 / clans.length) * index;
            const rad = (angle * Math.PI) / 180;
            const targetX = Math.cos(rad) * bannerRadius;
            const targetZ = Math.sin(rad) * bannerRadius;

            // Find closest hex to this banner position
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
            const r = Math.random();
            if (r > 0.6) type = 'code';
            else if (r > 0.3) type = 'english';
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

        // 2. Reset Clan Points (Give 50 for the Home Base)
        const { error: clanError } = await supabaseAdmin
            .from('clans')
            .update({ points: 50 })
            .neq('id', 'null'); 

        if (clanError) throw clanError;

        // 3. Post Announcement to Chat
        await supabaseAdmin.from('chat_messages').insert([{
            clan_id: 'SYSTEM',
            user_username: 'ADMIN',
            content: '⚠️ NEXUS NORMALIZED: HOME BASES ESTABLISHED. GRID INTEGRITY 100%.'
        }]);

        console.log('[AdminAPI] Global Reset Complete.');
        return res.status(200).json({ success: true, message: 'Map and points reset successfully' });

    } catch (error) {
        console.error('[AdminAPI] Reset Failed:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
