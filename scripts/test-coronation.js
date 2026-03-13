
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCoronation() {
    console.log('--- TESTING CORONATION LOGIC ---');
    try {
        // 1. Get leader
        const { data: clans, error: clansError } = await supabase
            .from('clans')
            .select('*')
            .order('points', { ascending: false })
            .limit(1);

        if (clansError) throw clansError;
        const winner = clans[0];
        console.log(`Current Leader: ${winner.name} (${winner.points} pts)`);

        // 2. Update game_settings
        const { data, error } = await supabase
            .from('game_settings')
            .upsert({ id: 1, last_champion_id: winner.id });

        if (error) {
            console.error('UPSERT ERROR:', error.message);
            console.error('ERROR CODE:', error.code);
            console.error('FULL ERROR:', JSON.stringify(error));
        } else {
            console.log('SUCCESS: Champion immortalized.');
        }
    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    }
}

testCoronation();
