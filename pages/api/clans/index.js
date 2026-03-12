import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();

  if (req.method === 'GET') {
    try {
      const result = await client.sql`SELECT * FROM clans ORDER BY points DESC;`;
      const clansMap = {};
      result.rows.forEach(clan => {
        clansMap[clan.id] = {
          name: clan.name,
          color: clan.color,
          points: clan.points,
          members: clan.members_count,
          icon: clan.icon
        };
      });
      return res.status(200).json(clansMap);
    } catch (error) {
      console.error('Fetch clans error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      await client.end();
    }
  }

  if (req.method === 'POST') {
    const { id, name, color, icon, points, members } = req.body;
    if (!id || !name || !color) return res.status(400).json({ message: 'Missing fields' });

    try {
      await client.sql`
        INSERT INTO clans (id, name, color, icon, points, members_count)
        VALUES (${id}, ${name}, ${color}, ${icon}, ${points || 0}, ${members || 0})
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name, color = EXCLUDED.color, icon = EXCLUDED.icon;
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Save clan error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      await client.end();
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    try {
      await client.sql`DELETE FROM clans WHERE id = ${id};`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete clan error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      await client.end();
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
