import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';
import rateLimit from '../../../lib/rateLimit';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!rateLimit(ip, 30, 60000)) {
    return res.status(429).json({ message: 'RATE LIMIT EXCEEDED. CALM DOWN.' });
  }

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
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.username !== username) {
      return res.status(403).json({ message: 'FORBIDDEN: NEURAL IMPRINT MISMATCH' });
    }

    if (!username) {
      return res.status(400).json({ message: 'Missing username' });
    }

    // FIELD LOCK: Protect points/credits from direct browser mutation
    // These must only be updated via dedicated game logic APIs (Conquest/Shop)
    const updateData = {};
    if (updates.newName) {
       const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
       if (usernameRegex.test(updates.newName)) updateData.username = updates.newName;
    }
    if (updates.active_skin) updateData.active_skin = updates.active_skin;
    if (updates.active_chat_color) updateData.active_chat_color = updates.active_chat_color;
    if (updates.active_border_color) updateData.active_border_color = updates.active_border_color;
    if (updates.active_shield_color) updateData.active_shield_color = updates.active_shield_color;
    
    // NOTE: points, credits, and spins are IGNORED here for security.

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: 'No valid updates provided' });
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
