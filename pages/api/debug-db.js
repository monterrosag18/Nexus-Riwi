import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // 1. Check if ENV variables exist (just check keys, don't expose values)
    const envCheck = {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPostgresUser: !!process.env.POSTGRES_USER,
      hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET
    };

    // 2. Test simple query
    const timeResult = await sql`SELECT NOW();`;
    
    // 3. Check for tables
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;

    return res.status(200).json({
      success: true,
      env: envCheck,
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
  }
}
