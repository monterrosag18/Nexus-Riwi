import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, itemId, cost, type, color } = req.body;
    if (!username || !itemId || cost === undefined) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // 1. Check user exists and has enough credits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits, owned_cosmetics')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.credits < cost) {
      return res.status(400).json({ message: 'INSUFFICIENT CREDITS' });
    }

    // 2. Add item to owned list if not already there
    const owned = user.owned_cosmetics || [];
    if (!owned.includes(itemId)) {
      owned.push(itemId);
    }

    // 3. Update user: deduct credits, update owned list
    const updateData = {
      credits: user.credits - cost,
      owned_cosmetics: owned
    };

    // 4. Auto-apply based on type
    if (type === 'skin') {
      updateData.active_skin = itemId;
    } else if (type === 'chat') {
      updateData.active_chat_color = color;
    } else if (type === 'border') {
      updateData.active_border_color = color;
    } else if (type === 'shield') {
      updateData.active_shield_color = color;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('username', username);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Purchase API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
