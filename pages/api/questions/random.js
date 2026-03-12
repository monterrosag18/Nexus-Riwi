import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const { type, difficulty } = req.query;

  try {
    let result;
    if (type && difficulty) {
      result = await sql`
        SELECT * FROM questions 
        WHERE type = ${type} AND difficulty = ${difficulty} 
        ORDER BY RANDOM() LIMIT 1;
      `;
    } else if (type) {
      result = await sql`
        SELECT * FROM questions 
        WHERE type = ${type} 
        ORDER BY RANDOM() LIMIT 1;
      `;
    } else {
      result = await sql`
        SELECT * FROM questions 
        ORDER BY RANDOM() LIMIT 1;
      `;
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No questions found for this criteria' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Fetch random question error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
