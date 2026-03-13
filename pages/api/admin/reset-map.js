
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
            .neq('id', -1); // Delete all where ID exists

        if (terrError) throw terrError;

        // 1.5 Repopulate with 130 Neutral Sectors (The Map Structure)
        console.log('[AdminAPI] Repopulating 130 neutral sectors...');
        const newTerritories = [];
        for (let i = 0; i < 130; i++) {
            let type = 'code';
            const r = Math.random();
            if (r > 0.6) type = 'code';
            else if (r > 0.3) type = 'english';
            else type = 'soft-skills';

            let biome = type === 'code' ? 'city' : (type === 'english' ? 'library' : 'park');
            newTerritories.push({
                id: i,
                owner_id: null,
                type: type,
                biome: biome,
                difficulty: Math.floor(Math.random() * 3) + 1
            });
        }

        const { error: insertError } = await supabaseAdmin
            .from('territories')
            .insert(newTerritories);

        if (insertError) throw insertError;

        // 2. Reset Clan Points
        const { error: clanError } = await supabaseAdmin
            .from('clans')
            .update({ points: 0 })
            .neq('id', 'null'); // Update all clans

        if (clanError) throw clanError;

        // 3. Post Announcement to Chat
        await supabaseAdmin.from('chat_messages').insert([{
            clan_id: 'SYSTEM',
            user_username: 'ADMIN',
            content: '⚠️ SYSTEM RESET INITIATED: ALL SECTORS RETURNED TO NEUTRAL STATUS.'
        }]);

        console.log('[AdminAPI] Global Reset Complete.');
        return res.status(200).json({ success: true, message: 'Map and points reset successfully' });

    } catch (error) {
        console.error('[AdminAPI] Reset Failed:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
