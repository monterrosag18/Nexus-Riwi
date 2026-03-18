
import { signToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { user, pass } = req.body;

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'nexusadmin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'nexusriwi2026';

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        // Generate a secure JWT for the admin session
        const sessionToken = signToken({ 
            username: ADMIN_USER, 
            role: 'SUPER_USER',
            auth_time: Date.now() 
        }, { expiresIn: '2h' });
        
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
