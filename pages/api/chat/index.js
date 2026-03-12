import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  if (req.method === 'GET') {
    const { clanId } = req.query;
    try {
      const result = await client.sql`
        SELECT * FROM chat_messages 
        WHERE clan_id = ${clanId} 
        ORDER BY created_at DESC 
        LIMIT 50;
      `;
      return res.status(200).json(result.rows.reverse());
    } catch (error) {
      console.error('Error fetching chat:', error);
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      await client.end();
    }
  }

  if (req.method === 'POST') {
    const { clanId, username, content } = req.body;
    try {
      await client.sql`
        INSERT INTO chat_messages (clan_id, user_username, content)
        VALUES (${clanId}, ${username}, ${content});
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
       console.error('Error posting chat:', error);
       return res.status(500).json({ message: 'Chat post error' });
    } finally {
      await client.end();
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
