import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';
import rateLimit from '../../../lib/rateLimit';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!rateLimit(ip, 30, 60000)) {
    return res.status(429).json({ message: 'CHAT THROTTLED. RELAX.' });
  }
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
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'UNAUTHORIZED: TOKEN MISSING' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (!decoded || decoded.username !== username) {
        return res.status(403).json({ message: 'FORBIDDEN: IDENTITY MISMATCH' });
      }

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
