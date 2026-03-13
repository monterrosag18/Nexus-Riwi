const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
    const tables = ['users', 'territories', 'clans'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1).maybeSingle();
        if (error) {
            console.log(`Table ${t} error: ${error.message}`);
        } else if (data) {
            console.log(`Table ${t} columns:`, Object.keys(data).join(', '));
        } else {
             console.log(`Table ${t}: EXISTS BUT EMPTY`);
        }
    }
}

inspectColumns();
