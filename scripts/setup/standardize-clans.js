const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_CLANS = [
    { id: 'turing', name: 'Turing', color: '#00c3ff', icon: '3d_atom', points: 0 },
    { id: 'tesla', name: 'Tesla', color: '#ff0000', icon: '3d_bolt', points: 0 },
    { id: 'hamilton', name: 'Hamilton', color: '#F2C94C', icon: '3d_pyramid', points: 0 }, // Yellow
    { id: 'mccarthy', name: 'McCarthy', color: '#00ff44', icon: '3d_gem', points: 0 },    // Green
    { id: 'thompson', name: 'Thompson', color: '#9B51E0', icon: '3d_shield', points: 0 }  // Purple
];

const REASSIGNMENT_MAP = {
    'omega': 'turing',
    'lovelace': 'thompson',
    'neumann': 'hamilton',
    'neutral': null
};

async function standardize() {
    console.log('--- STARTING CLAN STANDARDIZATION ---');

    const targetIds = TARGET_CLANS.map(c => c.id);

    // DUMMY SELECTIONS TO WARM UP SCHEMA CACHE
    await supabase.from('users').select('*').limit(1);
    await supabase.from('chat_messages').select('*').limit(1);
    await supabase.from('territories').select('*').limit(1);
    await supabase.from('clans').select('*').limit(1);

    // 1. Reassign users in users table
    console.log('Reassigning users from legacy clans...');
    for (const [legacyId, targetId] of Object.entries(REASSIGNMENT_MAP)) {
        const { error: userError } = await supabase
            .from('users')
            .update({ clan_id: targetId })
            .eq('clan_id', legacyId);
        
        if (userError) console.error(`Error reassigning user ${legacyId}:`, userError.message);
        else console.log(`✓ Reassigned ${legacyId} users to ${targetId || 'Neutral'}`);
    }

    // 2. Reassign chat messages in chat_messages table
    console.log('Reassigning chat messages from legacy clans...');
    for (const [legacyId, targetId] of Object.entries(REASSIGNMENT_MAP)) {
        const { error: chatError } = await supabase
            .from('chat_messages')
            .update({ clan_id: targetId })
            .eq('clan_id', legacyId);
        
        if (chatError) console.error(`Error reassigning chat for ${legacyId}:`, chatError.message);
        else console.log(`✓ Reassigned ${legacyId} chat messages to ${targetId || 'Neutral'}`);
    }

    // 3. Reassign territories in territories table
    console.log('Reassigning territories from legacy clans...');
    const { error: territoryError } = await supabase
        .from('territories')
        .update({ owner_id: 'neutral' })
        .not('owner_id', 'in', `(${targetIds.join(',')},neutral)`);
    
    if (territoryError) console.error('Error resetting territories:', territoryError.message);
    else console.log('✓ Legacy territories reset to neutral.');

    // 3. Clear old clans that are NOT in target list
    console.log('Removing non-standard clans...');
    const { error: deleteError } = await supabase
        .from('clans')
        .delete()
        .not('id', 'in', `(${targetIds.join(',')})`);
    
    if (deleteError) console.error('Error deleting clans:', deleteError.message);
    else console.log('✓ Legacy clans purged.');

    // 3. Upsert target clans
    console.log('Upserting standard clans...');
    for (const clan of TARGET_CLANS) {
        // We preserve points if they exist, otherwise 0
        const { data: existing } = await supabase.from('clans').select('points').eq('id', clan.id).maybeSingle();
        const { error: upsertError } = await supabase.from('clans').upsert({
            ...clan,
            points: existing ? existing.points : clan.points
        });

        if (upsertError) console.error(`Error upserting ${clan.id}:`, upsertError.message);
        else console.log(`✓ Clan ${clan.id} sealed.`);
    }

    console.log('--- STANDARDIZATION COMPLETE ---');
}

standardize();
