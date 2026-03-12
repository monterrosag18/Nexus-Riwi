import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT * FROM territories;`;
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching territories:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  if (req.method === 'POST') {
    // Logic for capturing territory
    const { id, clanId } = req.body;
    try {
      await sql`
        UPDATE territories 
        SET owner_id = ${clanId} 
        WHERE id = ${id};
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
       return res.status(500).json({ message: 'Conquest error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
