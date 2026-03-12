import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.sql`SELECT * FROM announcements ORDER BY created_at DESC LIMIT 20;`;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { msg, type } = req.body;
      if (!msg) return res.status(400).json({ message: 'Missing msg' });

      await client.sql`
        INSERT INTO announcements (msg, type)
        VALUES (${msg}, ${type || 'info'});
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Missing id' });

      await client.sql`DELETE FROM announcements WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin News API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
