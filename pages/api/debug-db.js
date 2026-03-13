import { supabaseAdmin } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function handler(req, res) {
    try {
        if (!supabaseAdmin) {
            const envKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('SUPABASE_'));
            return res.status(500).json({ 
                error: "Supabase Client failed to initialize.",
                hint: "Check if NEXT_PUBLIC_SUPABASE_URL is valid.",
                availableEnvKeys: envKeys,
                env: {
                    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
                    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
                }
            });
        }

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
        const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NONE';

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            info: "Diagnostic Deep Dive",
            env: {
                url: currentUrl,
                serviceKey: hasServiceKey ? 'PRESENT' : 'MISSING',
                // Masked keys to verify they aren't mangled or have spaces
                serviceKeyMask: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
                    `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...${process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-5)}` : 'NONE',
                anonKeyMask: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                    `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-5)}` : 'NONE'
            },
            clansCheck: clansError ? clansError : 'OK',
            gameSettingsCheck: settingsError ? settingsError : 'OK',
            schemaHint: settingsError?.hint || "NONE"
        });
    } catch (e) {
        return res.status(500).json({ error: e.message, stack: e.stack });
    }
}
