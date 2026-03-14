const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTerritories() {
    const { data, error } = await supabase.from('territories').select('*');
    if (error) {
        console.error('Error fetching territories:', error);
        return;
    }
    console.log(`Found ${data.length} territories.`);
    if (data.length > 0) {
        console.log('Sample rows:', data.slice(0, 5));
    }
}

checkTerritories();
