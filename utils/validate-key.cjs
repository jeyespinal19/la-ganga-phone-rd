const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const key = env.VITE_SUPABASE_ANON_KEY;
if (!key) {
    console.log('Key not found');
    process.exit(1);
}

try {
    const parts = key.split('.');
    if (parts.length !== 3) throw new Error('Not a JWT');

    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    console.log('JWT Header:', header);
    console.log('JWT Payload (partial):', {
        iss: payload.iss,
        role: payload.role,
        exp: payload.exp
    });

    // Check if issuer matches project
    if (payload.iss && payload.iss.includes('supabase')) {
        console.log('Issuer looks suspicious or generic:', payload.iss);
    } else {
        console.log('Issuer check: custom or unknown');
    }

} catch (e) {
    console.error('Invalid Key format:', e.message);
}
