import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { clanId } = req.query;
      const { data: messages, error } = await supabaseAdmin
        .from('chat_messages')
        .select('*')
        .eq('clan_id', clanId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json((messages || []).reverse());
    }

    if (req.method === 'POST') {
      const { clanId, username, content } = req.body;
      const { error } = await supabaseAdmin
        .from('chat_messages')
        .insert({
          clan_id: clanId,
          user_username: username,
          content: content
        });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
