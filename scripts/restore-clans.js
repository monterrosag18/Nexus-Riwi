
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const defaultClans = [
    { id: 'turing',   name: 'Turing',   color: '#2D9CDB', points: 0, icon: '3d_atom' },
    { id: 'tesla',    name: 'Tesla',    color: '#EB5757', points: 0, icon: '3d_bolt' },
    { id: 'mccarthy', name: 'McCarthy', color: '#27AE60', points: 0, icon: '3d_gem' },
    { id: 'thompson', name: 'Thompson', color: '#9B51E0', points: 0, icon: '3d_shield' },
    { id: 'hamilton', name: 'Hamilton', color: '#F2C94C', points: 0, icon: '3d_shield' }
];

async function restoreClans() {
  console.log('Restoring default clans...');
  for (const clan of defaultClans) {
    const { error } = await supabase.from('clans').upsert(clan);
    if (error) {
      console.error(`Error restoring ${clan.name}:`, error);
    } else {
      console.log(`Successfully restored ${clan.name}`);
    }
  }
}

restoreClans();
