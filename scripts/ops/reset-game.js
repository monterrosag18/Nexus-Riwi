const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetGame() {
  try {
    console.log('--- CRITICAL: SYSTEM RESET INITIATED (SUPABASE) ---');

    // 1. Reset all Clan points to 0
    console.log('Resetting clan points...');
    await supabase.from('clans').update({ points: 0 }).neq('id', 'placeholder'); // Filter to match all

    // 2. Reset all User points and credits (start credits at 2000)
    console.log('Resetting user stats...');
    await supabase.from('users').update({ points: 0, credits: 2000 }).neq('id', 'placeholder');

    // 3. Reset all Territories to Neutral (owner_id = NULL)
    console.log('Resetting all territories to neutral...');
    await supabase.from('territories').update({ owner_id: null }).neq('id', -1);

    // 4. Clear chat messages
    console.log('Clearing global chat...');
    await supabase.from('chat_messages').delete().neq('id', -1);

    // 5. Clear old announcements
    console.log('Clearing old news broadcasts...');
    await supabase.from('announcements').delete().neq('id', -1);

    console.log('--- RESET COMPLETE: NEXUS IS NOW VIRGIN STATE ---');

  } catch (e) {
    console.error('Reset failed:', e);
  }
}

resetGame();
