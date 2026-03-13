import { supabaseAdmin } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function handler(req, res) {
    try {
        // Test connection to a known table
        const { data: clans, error: clansError } = await supabaseAdmin
            .from('clans')
            .select('count', { count: 'exact', head: true });

        // Test connection to the new table
        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('game_settings')
            .select('*')
            .limit(1);
            
        // Check if we are using the service key
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            env: {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
                serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING',
                anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
            },
            clansCheck: clansError ? clansError : 'OK',
            gameSettingsCheck: settingsError ? settingsError : 'OK',
            keysSummary: {
                serviceKeyStart: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' : 'NONE'
            }
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
