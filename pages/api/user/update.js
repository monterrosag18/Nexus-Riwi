import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, updates } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Missing username' });
    }

    if (updates.newName) {
      await client.sql`UPDATE users SET username = ${updates.newName} WHERE username = ${username};`;
    }
    
    if (updates.active_skin) {
      await client.sql`UPDATE users SET active_skin = ${updates.active_skin} WHERE username = ${username};`;
    }
    if (updates.active_chat_color) {
      await client.sql`UPDATE users SET active_chat_color = ${updates.active_chat_color} WHERE username = ${username};`;
    }
    if (updates.active_border_color) {
      await client.sql`UPDATE users SET active_border_color = ${updates.active_border_color} WHERE username = ${username};`;
    }
    if (updates.active_shield_color) {
      await client.sql`UPDATE users SET active_shield_color = ${updates.active_shield_color} WHERE username = ${username};`;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update User API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
