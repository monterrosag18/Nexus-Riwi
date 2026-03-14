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

    // 3. Reset all Territories
    console.log('Resetting territories and established Home Bases...');
    
    // Grid Logic (Matching HexGrid.js & reset-map.js)
    const clans = ['turing', 'tesla', 'mccarthy', 'thompson', 'hamilton'];
    const ringSize = 12;
    const hexRadius = 8;
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;
    const bannerRadius = 170; 

    // Generate deterministic grid
    const allHexes = [];
    for (let q = -ringSize; q <= ringSize; q++) {
        for (let r = -ringSize; r <= ringSize; r++) {
            if (Math.abs(q + r) <= ringSize) {
                const x = hexWidth * (q + r / 2);
                const z = hexHeight * (3 / 4) * r;
                if (Math.sqrt(x * x + z * z) < 25) continue; // Tower void
                allHexes.push({ x, z, q, r });
            }
        }
    }

    // Find Home Base mappings
    const homeBaseMappings = clans.map((clanId, index) => {
        const angle = (360 / clans.length) * index;
        const rad = (angle * Math.PI) / 180;
        const targetX = Math.cos(rad) * bannerRadius;
        const targetZ = Math.sin(rad) * bannerRadius;

        let closestIdx = -1;
        let minDist = Infinity;
        allHexes.forEach((hex, i) => {
            const d = Math.sqrt((hex.x - targetX)**2 + (hex.z - targetZ)**2);
            if (d < minDist) {
                minDist = d;
                closestIdx = i;
            }
        });
        return { clanId, hexId: closestIdx };
    });

    // Reset all to Neutral first
    await supabase.from('territories').update({ owner_id: null }).neq('id', -1);

    // Assign Home Bases
    for (const mapping of homeBaseMappings) {
        await supabase.from('territories')
            .update({ owner_id: mapping.clanId, difficulty: 1 })
            .eq('id', mapping.hexId);
        console.log(`✓ Home Base for ${mapping.clanId.toUpperCase()} established at Sector #${mapping.hexId}`);
    }

    // 4. Clear chat messages
    console.log('Clearing global chat...');
    await supabase.from('chat_messages').delete().neq('id', -1);

    // 5. Clear old announcements
    console.log('Clearing old news broadcasts...');
    await supabase.from('announcements').delete().neq('id', -1);
    
    // 6. Give starting points to clans for their Home Base
    console.log('Distributing starting points...');
    await supabase.from('clans').update({ points: 50 }).neq('id', 'null');

    console.log('--- RESET COMPLETE: NEXUS IS NOW VIRGIN STATE ---');

  } catch (e) {
    console.error('Reset failed:', e);
  }
}

resetGame();
