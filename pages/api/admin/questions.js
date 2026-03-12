import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.sql`SELECT * FROM questions ORDER BY created_at DESC;`;
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { id, type, difficulty, q, options, correct } = req.body;
      if (!q || !options || correct === undefined) {
        return res.status(400).json({ message: 'Missing fields' });
      }

      if (id) {
        // Update
        await client.sql`
          UPDATE questions 
          SET type = ${type}, difficulty = ${difficulty}, q = ${q}, options = ${JSON.stringify(options)}, correct = ${correct}
          WHERE id = ${id};
        `;
      } else {
        // Create
        await client.sql`
          INSERT INTO questions (type, difficulty, q, options, correct)
          VALUES (${type}, ${difficulty}, ${q}, ${JSON.stringify(options)}, ${correct});
        `;
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Missing id' });

      await client.sql`DELETE FROM questions WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin Questions API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
