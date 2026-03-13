import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    const { type, difficulty } = req.query;
    
    let query = supabase.from('questions').select('*', { count: 'exact' });
    
    if (type) query = query.eq('type', type);
    if (difficulty) query = query.eq('difficulty', difficulty);

    // Get count first to pick a random index
    const { count, error: countError } = await query;
    if (countError) throw countError;
    if (!count || count === 0) {
      return res.status(404).json({ message: 'No questions found for this criteria' });
    }

    const randomIndex = Math.floor(Math.random() * count);
    
    // Fetch the random question
    let fetchQuery = supabase.from('questions').select('*');
    if (type) fetchQuery = fetchQuery.eq('type', type);
    if (difficulty) fetchQuery = fetchQuery.eq('difficulty', difficulty);
    
    const { data: question, error: fetchError } = await fetchQuery
      .range(randomIndex, randomIndex)
      .single();

    if (fetchError) throw fetchError;

    return res.status(200).json(question);
  } catch (error) {
    console.error('Fetch random question API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
