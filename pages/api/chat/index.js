import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  try {
    if (req.method === 'GET') {
      const { clanId } = req.query;
      const result = await client.sql`
        SELECT * FROM chat_messages 
        WHERE clan_id = ${clanId} 
        ORDER BY created_at DESC 
        LIMIT 50;
      `;
      return res.status(200).json(result.rows.reverse());
    }

    if (req.method === 'POST') {
      const { clanId, username, content } = req.body;
      await client.sql`
        INSERT INTO chat_messages (clan_id, user_username, content)
        VALUES (${clanId}, ${username}, ${content});
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
