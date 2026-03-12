import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  const client = await db.connect();
  try {
    // 1. Check if ENV variables exist
    const envCheck = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPostgresUser: !!process.env.POSTGRES_USER,
      hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET
    };

    // 2. Test simple query
    const timeResult = await client.sql`SELECT NOW();`;
    
    // 3. Check for tables
    const tablesResult = await client.sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;

    const url = process.env.POSTGRES_URL || '';
    const maskedUrl = url.replace(/:([^@]+)@/, ':****@').split('?')[0];

    return res.status(200).json({
      success: true,
      env: envCheck,
      postgresUrl: maskedUrl,
      time: timeResult.rows[0].now,
      tables: tablesResult.rows.map(r => r.table_name)
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
      envKeys: Object.keys(process.env).filter(k => k.includes('POSTGRES'))
    });
  } finally {
    if (client) await client.end();
  }
}
