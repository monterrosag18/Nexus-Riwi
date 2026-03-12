import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.sql`SELECT * FROM territories;`;
      return res.status(200).json(result.rows);
    }
    
    if (req.method === 'POST') {
      const { id, clanId } = req.body;
      await client.sql`
        UPDATE territories 
        SET owner_id = ${clanId} 
        WHERE id = ${id};
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Territories API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
