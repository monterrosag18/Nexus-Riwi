import { supabaseAdmin } from '../../../lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, updates } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'UNAUTHORIZED: TOKEN MISSING' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.username !== username) {
        return res.status(403).json({ message: 'FORBIDDEN: NEURAL IMPRINT MISMATCH' });
      }
    } catch (err) {
      return res.status(401).json({ message: 'UNAUTHORIZED: INVALID TOKEN' });
    }

    if (!username) {
      return res.status(400).json({ message: 'Missing username' });
    }

    // ATOMIC UPDATES LOGIC
    // We fetch current values first to ensure we don't overwrite with stale data
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('points, credits, total_spins')
      .eq('username', username)
      .single();

    if (fetchError) throw fetchError;

    const updateData = {};
    if (updates.newName) updateData.username = updates.newName;
    if (updates.active_skin) updateData.active_skin = updates.active_skin;
    if (updates.active_chat_color) updateData.active_chat_color = updates.active_chat_color;
    if (updates.active_border_color) updateData.active_border_color = updates.active_border_color;
    if (updates.active_shield_color) updateData.active_shield_color = updates.active_shield_color;
    
    // ATOMIC INCREMENTS
    if (updates.points !== undefined) {
        // Use relative addition if possible, but for simplicity here we do safe calculation
        updateData.points = (currentUser.points || 0) + (updates.points - (updates.oldPoints || currentUser.points || 0));
        // If the user just sent the final value, we should ideally use a delta.
        // Let's check if 'delta' was provided instead.
        if (updates.pointsDelta !== undefined) {
            updateData.points = (currentUser.points || 0) + updates.pointsDelta;
        } else {
            updateData.points = updates.points; // Fallback
        }
    }
    
    if (updates.credits !== undefined) {
        if (updates.creditsDelta !== undefined) {
            updateData.credits = (currentUser.credits || 0) + updates.creditsDelta;
        } else {
            updateData.credits = updates.credits;
        }
    }

    if (updates.incrementSpins) {
        updateData.total_spins = (currentUser.total_spins || 0) + 1;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: 'No updates provided' });
    }

    const { error } = await supabaseAdmin
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
