import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT * FROM announcements ORDER BY created_at DESC LIMIT 20;`;
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Fetch news error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { msg, type } = req.body;
    if (!msg) return res.status(400).json({ message: 'Missing msg' });

    try {
      await sql`
        INSERT INTO announcements (msg, type)
        VALUES (${msg}, ${type || 'info'});
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Save news error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    try {
      await sql`DELETE FROM announcements WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete news error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
