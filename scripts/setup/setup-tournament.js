
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupGameSettingsTable() {
    console.log('--- SETTING UP game_settings TABLE ---');
    
    // We can't run raw SQL easily via the client for table creation without a proxy or RPC.
    // However, we can use the 'clans' table as a reference and see if we can just update a 'metadata' row there or similar.
    // BUT the user asked for a week-long carryover. 
    
    // Let's try to insert a record into a table named 'game_settings'. 
    // If it doesn't exist, I'll have to ask the user to run a SQL snippet.
    
    try {
        const { error } = await supabase
            .from('game_settings')
            .upsert({ id: 1, last_champion_id: null }, { onConflict: 'id' });
            
        if (error && error.code === '42P01') {
            console.error('Table "game_settings" DOES NOT EXIST. Please run the SQL snippet in Supabase SQL Editor:');
            console.log(`
CREATE TABLE game_settings (
    id INTEGER PRIMARY KEY,
    last_champion_id TEXT REFERENCES clans(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
INSERT INTO game_settings (id, last_champion_id) VALUES (1, NULL) ON CONFLICT DO NOTHING;
            `);
        } else if (error) {
            throw error;
        } else {
            console.log('Table "game_settings" is ready and initialized.');
        }
    } catch (e) {
        console.error('Error checking table:', e.message);
    }
}

setupGameSettingsTable();
