import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  try {
    if (req.method === 'GET') {
      const result = await client.sql`
        SELECT c.*, COUNT(u.id) as real_member_count
        FROM clans c
        LEFT JOIN users u ON LOWER(c.id) = LOWER(u.clan_id)
        GROUP BY c.id
        ORDER BY c.points DESC;
      `;
      const clansMap = {};
      result.rows.forEach(clan => {
        clansMap[clan.id] = {
          name: clan.name,
          color: clan.color,
          points: clan.points,
          members: parseInt(clan.real_member_count) || 0,
          icon: clan.icon
        };
      });
      return res.status(200).json(clansMap);
    }

    if (req.method === 'POST') {
      const { id, name, color, icon, points, members } = req.body;
      if (!id || !name || !color) return res.status(400).json({ message: 'Missing fields' });

      await client.sql`
        INSERT INTO clans (id, name, color, icon, points, members_count)
        VALUES (${id}, ${name}, ${color}, ${icon}, ${points || 0}, ${members || 0})
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name, color = EXCLUDED.color, icon = EXCLUDED.icon;
      `;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Missing id' });

      await client.sql`DELETE FROM clans WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Clans API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
