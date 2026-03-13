import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return res.status(200).json(questions);
    }

    if (req.method === 'POST') {
      const { id, type, difficulty, q, options, correct } = req.body;
      if (!q || !options || correct === undefined) {
        return res.status(400).json({ message: 'Missing fields' });
      }

      const questionData = { type, difficulty, q, options, correct };

      if (id) {
        // Update
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('questions')
          .insert(questionData);
        if (error) throw error;
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Missing id' });

      const { error } = await supabase
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
