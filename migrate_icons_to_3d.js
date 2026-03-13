
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const iconMapping = {
  'f2db': '3d_atom',   // Turing
  'f0e7': '3d_bolt',   // Tesla
  'f544': '3d_gem',    // McCarthy
  'f085': '3d_shield', // Thompson
  'f06d': '3d_bolt'    // Hamilton
};

async function migrateIcons() {
  const { data: clans, error } = await supabase.from('clans').select('*');
  if (error) {
    console.error('Error fetching clans:', error);
    return;
  }

  for (const clan of clans) {
    const newIcon = iconMapping[clan.icon] || '3d_shield';
    console.log(`Migrating clan ${clan.id}: ${clan.icon} -> ${newIcon}`);
    
    const { error: updateError } = await supabase
      .from('clans')
      .update({ icon: newIcon })
      .eq('id', clan.id);
      
    if (updateError) {
      console.error(`Error updating clan ${clan.id}:`, updateError);
    }
  }
}

migrateIcons();
