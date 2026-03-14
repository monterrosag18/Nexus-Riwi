const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // USE SERVICE ROLE
const supabase = createClient(supabaseUrl, supabaseKey);

async function runReset() {
    try {
        console.log('[Debug] Starting Global Map Reset...');

        // 1. Clear Territories
        const { error: terrError } = await supabase
            .from('territories')
            .delete()
            .neq('id', -1); 

        if (terrError) throw terrError;

        // 1.5 Repopulate with 130 Sectors + Home Bases
        console.log('[Debug] Generating map grid...');
        
        const clans = ['turing', 'tesla', 'mccarthy', 'thompson', 'hamilton'];
        const ringSize = 12;
        const hexRadius = 8;
        const hexWidth = Math.sqrt(3) * hexRadius;
        const hexHeight = 2 * hexRadius;
        
        const allHexes = [];
        for (let q = -ringSize; q <= ringSize; q++) {
            for (let r = -ringSize; r <= ringSize; r++) {
                if (Math.abs(q + r) <= ringSize) {
                    const x = hexWidth * (q + r / 2);
                    const z = hexHeight * (3 / 4) * r;
                    if (Math.sqrt(x * x + z * z) < 25) continue;
                    allHexes.push({ x, z, q, r });
                }
            }
        }

        console.log(`[Debug] Total hexes calculated: ${allHexes.length}`);

        const bannerRadius = 170; 
        const startingIndices = clans.map((clanId, index) => {
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
            return { clanId, hexIdx: closestIdx };
        });

        const newTerritories = allHexes.map((hex, i) => {
            const homeBase = startingIndices.find(sb => sb.hexIdx === i);
            let type = 'code';
            const r = Math.random();
            if (r > 0.6) type = 'code';
            else if (r > 0.3) type = 'english';
            else type = 'soft-skills';

            return {
                id: i,
                owner_id: homeBase ? homeBase.clanId : null,
                type: type,
                biome: type === 'code' ? 'city' : (type === 'english' ? 'library' : 'park'),
                difficulty: homeBase ? 1 : (Math.floor(Math.random() * 3) + 1)
            };
        });

        console.log(`[Debug] Attempting to insert ${newTerritories.length} rows...`);

        const { data, error: insertError } = await supabase
            .from('territories')
            .insert(newTerritories)
            .select();

        if (insertError) {
            console.error('[Debug] Insert Error:', insertError);
            throw insertError;
        }

        console.log(`[Debug] Successfully inserted ${data ? data.length : 0} rows.`);

    } catch (error) {
        console.error('[Debug] Reset Failed:', error);
    }
}

runReset();
