const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedClans() {
  try {
    const clans = [
      { id: 'turing', name: 'Turing', color: '#2D9CDB', points: 2606, members_count: 25, icon: 'f2db' },
      { id: 'tesla', name: 'Tesla', color: '#EB5757', points: 1932, members_count: 28, icon: 'f0e7' },
      { id: 'mccarthy', name: 'McCarthy', color: '#27AE60', points: 1373, members_count: 22, icon: 'f544' },
      { id: 'thompson', name: 'Thompson', color: '#9B51E0', points: 1105, members_count: 18, icon: 'f085' },
      { id: 'hamilton', name: 'Hamilton', color: '#F2C94C', points: 940, members_count: 15, icon: 'f06d' }
    ];

    const { error } = await supabase.from('clans').upsert(clans);
    if (error) throw error;
    console.log('Seeded clans');
  } catch (error) {
    console.error('Error seeding clans:', error);
  }
}

async function seedTerritories() {
  try {
    const { count } = await supabase.from('territories').select('*', { count: 'exact', head: true });
    
    if (count === 0) {
      console.log('Seeding 100 territories...');
      const territories = [];
      for (let i = 0; i < 100; i++) {
        let type = 'code';
        const r = Math.random();
        if (r > 0.6) type = 'code';
        else if (r > 0.3) type = 'english';
        else type = 'soft-skills';

        let biome = type === 'code' ? 'city' : (type === 'english' ? 'library' : 'park');
        territories.push({
            id: i,
            owner_id: null,
            type: type,
            biome: biome,
            difficulty: Math.floor(Math.random() * 3) + 1
        });
      }

      const { error } = await supabase.from('territories').insert(territories);
      if (error) throw error;
      console.log('Seeded territories');
    } else {
      console.log('Territories already seeded.');
    }
  } catch (error) {
    console.error('Error seeding territories:', error);
  }
}

async function main() {
  console.log('--- INITIALIZING SUPABASE SEED ---');
  await seedClans();
  await seedTerritories();
  console.log('--- SEED COMPLETE ---');
}

main().catch(console.error);
