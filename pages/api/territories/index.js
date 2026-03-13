import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data: territories, error } = await supabase
        .from('territories')
        .select('*');
      
      if (error) throw error;
      return res.status(200).json(territories);
    }
    
    if (req.method === 'POST') {
      const { id, clanId } = req.body;
      const { error } = await supabase
        .from('territories')
        .update({ owner_id: clanId })
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Territories API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
