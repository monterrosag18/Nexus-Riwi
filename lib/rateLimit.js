// Simple rate limiting in-memory (per instance)
// Note: In serverless, this is imperfect but helps prevent basic spam.
// For production, a Redis-based approach is recommended.

const rates = new Map();

export default function rateLimit(ip, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const userRate = rates.get(ip) || { count: 0, reset: now + windowMs };

    if (now > userRate.reset) {
        userRate.count = 1;
        userRate.reset = now + windowMs;
    } else {
        userRate.count++;
    }

    rates.set(ip, userRate);
    return userRate.count <= limit;
}
