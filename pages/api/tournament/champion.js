
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            // Get last champion
            const { data, error } = await supabaseAdmin
                .from('game_settings')
                .select('last_champion_id')
                .eq('id', 1)
                .single();

            if (error) {
                // Return null if table/record not found yet
                return res.status(200).json({ champion: null });
            }

            if (!data.last_champion_id) return res.status(200).json({ champion: null });

            // Fetch clan details
            const { data: clan, error: clanError } = await supabaseAdmin
                .from('clans')
                .select('*')
                .eq('id', data.last_champion_id)
                .single();

            if (clanError) throw clanError;

            return res.status(200).json({ champion: clan });
        }

        if (req.method === 'POST') {
            // FINALIZE TOURNAMENT: Capture current winner
            const { data: clans, error: clansError } = await supabaseAdmin
                .from('clans')
                .select('*')
                .order('points', { ascending: false })
                .limit(1);

            if (clansError) throw clansError;
            if (clans.length === 0) return res.status(400).json({ message: 'No clans found' });

            const winner = clans[0];

            const { error: updateError } = await supabaseAdmin
                .from('game_settings')
                .upsert({ id: 1, last_champion_id: winner.id });

            if (updateError) throw updateError;

            // Announce in chat
            await supabaseAdmin.from('chat_messages').insert([{
                clan_id: 'SYSTEM',
                user_username: 'ADMIN',
                content: `🏆 CONGRATULATIONS TO ${winner.name.toUpperCase()}! They are the NEW WEEKLY CHAMPIONS!`
            }]);

            return res.status(200).json({ success: true, champion: winner });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (error) {
        console.error('Champion API Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
