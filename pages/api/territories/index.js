import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  if (req.method === 'GET') {
    try {
      const result = await client.sql`SELECT * FROM territories;`;
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching territories:', error);
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      await client.end();
    }
  }
  
  if (req.method === 'POST') {
    // Logic for capturing territory
    const { id, clanId } = req.body;
    try {
      await client.sql`
        UPDATE territories 
        SET owner_id = ${clanId} 
        WHERE id = ${id};
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
       return res.status(500).json({ message: 'Conquest error' });
    } finally {
      await client.end();
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
