import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log configuration status (remove in production)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not found in environment variables');
    console.log('Please create .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
} else {
    console.log('✅ Supabase credentials loaded successfully');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);