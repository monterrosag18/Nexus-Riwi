import { supabase, supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Simple Security Shield: Protect mutations
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken.length < 20) {
    console.warn('[Security] Unauthorized points mutation blocked.');
    return res.status(403).json({ message: 'AUTH_REQUIRED' });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { clanId, amount } = req.body;
    if (!clanId || amount === undefined) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Get current points
    const { data: clan, error: fetchError } = await supabaseAdmin
      .from('clans')
      .select('points')
      .eq('id', clanId)
      .single();

    if (fetchError) throw fetchError;

    // Update with new points
    const { error: updateError } = await supabaseAdmin
      .from('clans')
      .update({ points: (clan.points || 0) + amount })
      .eq('id', clanId);

    if (updateError) throw updateError;
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Points sync error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
