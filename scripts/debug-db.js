const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSchema() {
    // Try to list tables via RPC if available, or just common queries
    const tables = ['users', 'profiles', 'clans', 'territories', 'chat'];
    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table ${t}: NOT FOUND (${error.message})`);
        } else {
            console.log(`Table ${t}: FOUND (${count} rows)`);
        }
    }
}

debugSchema();
