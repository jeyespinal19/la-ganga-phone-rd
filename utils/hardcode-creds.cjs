const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const servicePath = path.resolve(__dirname, '../services/supabase.ts');

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Credentials missing in .env.local');
    process.exit(1);
}

const newContent = `
import { createClient } from '@supabase/supabase-js';

// HARDCODED CREDENTIALS FOR DEBUGGING
const SUPABASE_URL = '${url}';
const SUPABASE_ANON_KEY = '${key}';

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
`;

fs.writeFileSync(servicePath, newContent);
console.log('Successfully hardcoded credentials into services/supabase.ts');
