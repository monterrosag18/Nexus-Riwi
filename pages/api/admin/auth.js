
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { user, pass } = req.body;

    // Hardcoded for now as requested, but on server-side (not visible to users)
    // In production, these should be in environment variables
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'nexusadmin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'nexusriwi2026';

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        // Generate a simple secure-looking session token
        // In a real app, use JWT or iron-session
        const sessionToken = Buffer.from(`${ADMIN_USER}:${Date.now()}:${process.env.SUPABASE_SERVICE_ROLE_KEY || 'secret'}`).toString('base64');
        
        return res.status(200).json({ 
            success: true, 
            token: sessionToken 
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: 'ACCESS DENIED — INVALID CREDENTIALS' 
        });
    }
}
