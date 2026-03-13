import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const { clanId } = req.query;
  if (!clanId) return res.status(400).json({ message: 'Missing clanId' });

  const client = await db.connect();

  try {
    // Fetch users for the given clan
    const result = await client.sql`
      SELECT username as name, clan_id as clan, points 
      FROM users 
      WHERE clan_id = ${clanId}
      ORDER BY points DESC;
    `;
 Joe:
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch Clan Members API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
