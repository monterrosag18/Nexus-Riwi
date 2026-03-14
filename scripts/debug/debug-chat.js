const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugChat() {
    const { data: chatm, error: errm } = await supabase.from('chat_messages').select('*').limit(1).maybeSingle();
    if (errm) console.log('chat_messages error:', errm.message);
    else if (chatm) console.log('chat_messages columns:', Object.keys(chatm).join(', '));
    else console.log('chat_messages: EMPTY');

    const { data: chat, error: err } = await supabase.from('chat').select('*').limit(1).maybeSingle();
     if (err) console.log('chat error:', err.message);
    else if (chat) console.log('chat columns:', Object.keys(chat).join(', '));
    else console.log('chat: EMPTY');
}

debugChat();
