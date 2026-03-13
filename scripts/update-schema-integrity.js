const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSchema() {
  console.log('--- UPDATING SCHEMA FOR INTEGRITY PHASE ---');
  
  // Note: Supabase JS client doesn't support ALTER TABLE directly easily.
  // We will try to use the 'rpc' method if a generic 'exec_sql' function exists, 
  // or simply document it for the user if it fails.
  // Most Supabase setups don't have 'exec_sql' by default for security.
  
  console.log('IMPORTANT: Please run the following SQL in your Supabase Dashboard SQL Editor:');
  console.log(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_session_id UUID;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spins INTEGER DEFAULT 0;
  `);
  
  // We can try to "upsert" a dummy record to see if columns exist, but that's messy.
  // Instead, let's proceed with code changes. The code will handle missing columns gracefully or fail clearly.
}

updateSchema();
