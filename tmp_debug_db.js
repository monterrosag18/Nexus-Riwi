
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugClans() {
  const { data, error } = await supabase.from('clans').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('--- DETAILED CLANS DATA ---');
  data.forEach(c => {
    const charCodes = c.icon ? c.icon.split('').map(char => char.charCodeAt(0).toString(16)).join(', ') : 'null';
    console.log(`ID: ${c.id.padEnd(10)} | Icon: ${c.icon.padEnd(12)} | CharCodes: [${charCodes}]`);
  });
}

debugClans();
