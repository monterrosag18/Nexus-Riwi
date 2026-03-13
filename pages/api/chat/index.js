import { supabaseAdmin } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'your-secret-key';

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
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'UNAUTHORIZED: TOKEN MISSING' });
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.username !== username) {
          return res.status(403).json({ message: 'FORBIDDEN: IDENTITY MISMATCH' });
        }
      } catch (err) {
        return res.status(401).json({ message: 'UNAUTHORIZED: INVALID TOKEN' });
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
