// Supabase Client for the Frontend (Browser)
// Using credentials from .env.local

const SUPABASE_URL = "https://jxlddvrcmjaknvizzngi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bGRkdnJjbWpha252aXp6bmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM2MjIsImV4cCI6MjA4ODkzOTYyMn0.rdxaEQvFY6O0CeXNKef209uLyYFQWUNS_L6IvtMr2pc";

if (typeof supabase === 'undefined') {
    console.error("Supabase CDN not loaded. Realtime features will be disabled.");
}

export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
