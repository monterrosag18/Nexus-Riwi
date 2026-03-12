import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { clanId, amount } = req.body;

  if (!clanId || amount === undefined) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await sql`
      UPDATE clans 
      SET points = points + ${amount} 
      WHERE id = ${clanId};
    `;
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Points sync error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
