import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'nexus-riwi-cyber-secret-2026-v3-PURGE';

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

export function signToken(payload, options = { expiresIn: '1d' }) {
    return jwt.sign(payload, JWT_SECRET, options);
}

export function getSecret() {
    return JWT_SECRET;
}
