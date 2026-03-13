const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkQuestions() {
  const { data, count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact' });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total questions:', count);
    if (data && data.length > 0) {
      console.log('Sample question:', data[0]);
    }
  }
}

checkQuestions();
