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
        // Check if we are using the service key
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NONE';

        return res.status(200).json({
            timestamp: new Date().toISOString(),
            info: "Diagnostic Deep Dive",
            env: {
                url: currentUrl,
                serviceKey: hasServiceKey ? 'PRESENT' : 'MISSING',
                anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
            },
            clansCheck: clansError ? clansError : 'OK',
            gameSettingsCheck: settingsError ? settingsError : 'OK',
            // Try to see what else is in the schema to identify project mismatch
            schemaHint: settingsError?.hint || "NONE",
            diagnosticTip: "Check if the URL above matches exactly your Supabase Project URL in the dashboard."
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
