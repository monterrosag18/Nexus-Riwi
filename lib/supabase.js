import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Safe client initialization helper
const safeCreateClient = (url, key, name) => {
    try {
        if (!url || !key) {
            console.warn(`[Supabase] ${name}: URL or Key missing.`);
            return null;
        }
        return createClient(url, key);
    } catch (err) {
        console.error(`[Supabase] ${name} Init Error:`, err.message);
        return null;
    }
};

export const supabase = safeCreateClient(supabaseUrl, supabaseAnonKey, 'Client');
export const supabaseAdmin = safeCreateClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, 'Admin');
