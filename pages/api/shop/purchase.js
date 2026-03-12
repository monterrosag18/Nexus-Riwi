import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, itemId, cost, type, color } = req.body;

  if (!username || !itemId || cost === undefined) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const client = await db.connect();

  try {
    // 1. Check user exists and has enough credits
    const userResult = await client.sql`SELECT credits, owned_cosmetics FROM users WHERE username = ${username} LIMIT 1;`;
    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    if (user.credits < cost) {
      return res.status(400).json({ message: 'INSUFFICIENT CREDITS' });
    }

    // 2. Add item to owned list if not already there
    const owned = user.owned_cosmetics || [];
    if (!owned.includes(itemId)) {
      owned.push(itemId);
    }

    // 3. Update user: deduct credits, update owned list
    await client.sql`
      UPDATE users 
      SET credits = credits - ${cost}, 
          owned_cosmetics = ${JSON.stringify(owned)}
      WHERE username = ${username}
    `;

    // 4. Auto-apply based on type
    if (type === 'skin') {
      await client.sql`UPDATE users SET active_skin = ${itemId} WHERE username = ${username};`;
    } else if (type === 'chat') {
      await client.sql`UPDATE users SET active_chat_color = ${color} WHERE username = ${username};`;
    } else if (type === 'border') {
      await client.sql`UPDATE users SET active_border_color = ${color} WHERE username = ${username};`;
    } else if (type === 'shield') {
      await client.sql`UPDATE users SET active_shield_color = ${color} WHERE username = ${username};`;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Purchase error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.end();
  }
}
