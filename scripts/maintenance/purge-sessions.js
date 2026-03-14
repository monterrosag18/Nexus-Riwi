const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function purgeSessions() {
  console.log('🚀 INITIALIZING GLOBAL SESSION PURGE...');
  
  const { error } = await supabaseAdmin
    .from('users')
    .update({ last_session_id: null })
    .neq('username', 'SYSTEM_ACCOUNT_IGNORE');

  if (error) {
    console.error('❌ PURGE FAILED:', error);
  } else {
    console.log('✅ ALL NEURAL LINKS TERMINATED. USERS MUST RE-AUTHENTICATE.');
  }
}

purgeSessions();
