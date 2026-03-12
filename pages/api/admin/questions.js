import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT * FROM questions ORDER BY created_at DESC;`;
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Fetch questions error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { id, type, difficulty, q, options, correct } = req.body;
    if (!q || !options || correct === undefined) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    try {
      if (id) {
        // Update
        await sql`
          UPDATE questions 
          SET type = ${type}, difficulty = ${difficulty}, q = ${q}, options = ${JSON.stringify(options)}, correct = ${correct}
          WHERE id = ${id};
        `;
      } else {
        // Create
        await sql`
          INSERT INTO questions (type, difficulty, q, options, correct)
          VALUES (${type}, ${difficulty}, ${q}, ${JSON.stringify(options)}, ${correct});
        `;
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Save question error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    try {
      await sql`DELETE FROM questions WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete question error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
