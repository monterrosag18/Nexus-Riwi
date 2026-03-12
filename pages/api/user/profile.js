import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Missing username' });
  }

  try {
    const result = await sql`
      SELECT username, clan_id, credits, active_skin, active_chat_color, active_border_color, active_shield_color, owned_cosmetics 
      FROM users 
      WHERE username = ${username} 
      LIMIT 1;
    `;

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    return res.status(200).json({
      name: user.username,
      clan: user.clan_id,
      credits: user.credits,
      activeSkin: user.active_skin,
      activeChatColor: user.active_chat_color,
      activeBorderColor: user.active_border_color,
      activeShieldColor: user.active_shield_color,
      ownedCosmetics: user.owned_cosmetics || []
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
