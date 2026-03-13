import { supabaseAdmin } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function handler(req, res) {
    // Set headers to prevent any caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    
    // Simple Security Shield: Protect mutations
    if (req.method === 'POST') {
        const adminToken = req.headers['x-admin-token'];
        if (!adminToken || adminToken.length < 20) {
            console.warn('[Security] Unauthorized coronation blocked.');
            return res.status(403).json({ message: 'AUTH_REQUIRED' });
        }
    }

    try {
        if (req.method === 'GET') {
            // Get last champion
            console.log("[ChampionAPI] Fetching last champion from game_settings...");
            
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.error("[ChampionAPI] ERROR: SUPABASE_SERVICE_ROLE_KEY is MISSING in environment.");
            }

            const { data, error } = await supabaseAdmin
                .from('game_settings')
                .select('last_champion_id')
                .eq('id', 1)
                .single();

            if (error) {
                console.warn("[ChampionAPI] Fetch Error:", error.message);
                // Return null if table not found, but log detail
                return res.status(200).json({ champion: null, debug: error.message });
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
            console.log("[ChampionAPI] STARTING CORONATION PROCESS...");
            
            // 1. Get current leader
            const { data: clans, error: clansError } = await supabaseAdmin
                .from('clans')
                .select('*')
                .order('points', { ascending: false })
                .limit(1);

            if (clansError) {
                console.error("[ChampionAPI] Error fetching leaderboard:", clansError.message);
                throw clansError;
            }
            
            if (clans.length === 0) return res.status(400).json({ message: 'No clans found in database.' });

            const winner = clans[0];
            console.log(`[ChampionAPI] Winner identified: ${winner.name} (${winner.id})`);

            // 2. Persist to game_settings
            console.log("[ChampionAPI] Attempting to UPSERT into game_settings...");
            const { error: updateError } = await supabaseAdmin
                .from('game_settings')
                .upsert({ id: 1, last_champion_id: winner.id });

            if (updateError) {
                console.error("[ChampionAPI] UPSERT ERROR:", updateError.message);
                console.error("[ChampionAPI] DETAIL:", updateError.details);
                return res.status(500).json({ 
                    success: false, 
                    message: "Database Update Failed", 
                    error: updateError.message,
                    details: updateError.details 
                });
            }

            console.log("[ChampionAPI] SUCCESS: Database updated.");

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
