
import { createClient } from '@supabase/supabase-js';

// HARDCODED CREDENTIALS FOR DEBUGGING
const SUPABASE_URL = 'https://aslefanefuemtowgkqhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGVmYW5lZnVlbXRvd2drcWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU4MzcsImV4cCI6MjA4MjcwMTgzN30.nrnWwoTTV0_u6J46O45sFUJa0EhM7KDiDB5CoVAuX6k';

console.log('Using HARDCODED Supabase Credentials');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
    }
  }
});
