import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, updates } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Missing username' });
    }

    const updateData = {};
    if (updates.newName) updateData.username = updates.newName;
    if (updates.active_skin) updateData.active_skin = updates.active_skin;
    if (updates.active_chat_color) updateData.active_chat_color = updates.active_chat_color;
    if (updates.active_border_color) updateData.active_border_color = updates.active_border_color;
    if (updates.active_shield_color) updateData.active_shield_color = updates.active_shield_color;
    if (updates.points !== undefined) updateData.points = updates.points;
    if (updates.credits !== undefined) updateData.credits = updates.credits;

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: 'No updates provided' });
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('username', username);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update User API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
