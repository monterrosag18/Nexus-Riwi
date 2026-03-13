import { verifyToken } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'MISSING NEURAL SIGNATURE' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ message: 'INVALID OR EXPIRED SIGNATURE' });
    }

    // Optional: Deep verify against DB for session_id if needed
    // But for a fast pulse check, the JWT verification is usually enough
    // since rotating the secret handles the global logout.
    
    return res.status(200).json({
        valid: true,
        user: {
            id: decoded.id,
            username: decoded.username,
            clan: decoded.clan
        }
    });
}
