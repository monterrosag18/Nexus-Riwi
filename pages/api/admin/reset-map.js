
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('[AdminAPI] Starting Global Map Reset...');

        // 1. Clear Territories
        const { error: terrError } = await supabaseAdmin
            .from('territories')
            .delete()
            .neq('id', -1); // Delete all where ID exists

        if (terrError) throw terrError;

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
