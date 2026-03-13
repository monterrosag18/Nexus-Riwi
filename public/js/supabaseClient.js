// Supabase Client for the Frontend (Browser)
// Dynamically initialized via /api/config

let client = null;
let initPromise = null;

export async function getSupabaseClient() {
    if (client) return client;
    
    if (!initPromise) {
        initPromise = (async () => {
            try {
                const res = await fetch('/api/config');
                const { data } = await res.json();
                const config = JSON.parse(atob(data));
                
                if (typeof supabase === 'undefined') {
                    throw new Error("Neural Link CDN not loaded.");
                }
                
                client = supabase.createClient(config.url, config.anonKey);
                return client;
            } catch (err) {
                console.error('[Supabase] Init Failed:', err.message);
                return null;
            }
        })();
    }
    
    return initPromise;
}

// For legacy compatibility during transition
export const supabaseClient = null; 
