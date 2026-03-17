import { supabase } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // SECURITY: Verify the requester is a logged-in user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'AUTHENTICATION_REQUIRED' });
    }
    const token = authHeader.split(' ')[1];
    if (!verifyToken(token)) {
      return res.status(403).json({ message: 'INVALID_SESSION' });
    }

    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: 'Missing username' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('username, clan_id, credits, points, active_skin, active_chat_color, active_border_color, active_shield_color, owned_cosmetics')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      name: user.username,
      clan: user.clan_id,
      credits: user.credits,
      points: user.points || 0,
      activeSkin: user.active_skin,
      activeChatColor: user.active_chat_color,
      activeBorderColor: user.active_border_color,
      activeShieldColor: user.active_shield_color,
      ownedCosmetics: user.owned_cosmetics || []
    });
  } catch (error) {
    console.error('Profile fetch API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
