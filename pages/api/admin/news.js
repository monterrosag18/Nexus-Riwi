import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    const adminToken = req.headers['x-admin-token'];
    const decoded = verifyToken(adminToken);
    if (!decoded || decoded.role !== 'SUPER_USER') {
      console.warn('[Security] Unauthorized news mutation blocked.');
      return res.status(403).json({ message: 'ADMIN_AUTH_REQUIRED' });
    }
  }

  try {
    if (req.method === 'GET') {
      const { data: news, error } = await supabaseAdmin
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return res.status(200).json(news);
    }

    if (req.method === 'POST') {
      const { msg, type } = req.body;
      if (!msg) return res.status(400).json({ message: 'Missing msg' });

      const { error } = await supabaseAdmin
        .from('announcements')
        .insert({ msg, type: type || 'info' });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Missing id' });

      const { error } = await supabaseAdmin
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin News API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
