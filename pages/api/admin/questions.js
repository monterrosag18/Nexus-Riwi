import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    const adminToken = req.headers['x-admin-token'];
    const decoded = verifyToken(adminToken);
    if (!decoded || decoded.role !== 'SUPER_USER') {
      console.warn('[Security] Unauthorized question bank access blocked.');
      return res.status(403).json({ message: 'ADMIN_AUTH_REQUIRED' });
    }
  }

  try {
    // 1. GET: Fetch all questions (Admin View)
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('questions')
        .select('*')
        .order('type', { ascending: true })
        .order('difficulty', { ascending: true });
      
      if (error) throw error;
      return res.status(200).json(data);
    }

    // 2. POST: Create or Update Question
    if (req.method === 'POST') {
      const qData = req.body;
      const { id, ...cleanData } = qData;

      if (id) {
        // Update
        const { error } = await supabaseAdmin
          .from('questions')
          .update(cleanData)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabaseAdmin
          .from('questions')
          .insert([cleanData]);
        if (error) throw error;
      }
      return res.status(200).json({ success: true });
    }

    // 3. DELETE: Remove Question
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'ID required' });

      const { error } = await supabaseAdmin
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin Questions API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
