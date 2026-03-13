
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Return only the public anon keys needed for the client
    // These are safe to expose to the browser as intended by Supabase
    const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };

    // Obfuscate for the network tab
    const encoded = Buffer.from(JSON.stringify(config)).toString('base64');
    res.status(200).json({ data: encoded });
}
