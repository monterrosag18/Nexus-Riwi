
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClans() {
  const { data, error } = await supabase.from('clans').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('--- CLANS DATA ---');
  data.forEach(c => {
    console.log(`ID: ${c.id}, Name: ${c.name}, Icon: ${c.icon}`);
  });
}

checkClans();
