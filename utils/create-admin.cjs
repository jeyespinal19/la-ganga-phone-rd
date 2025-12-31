const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        const key = parts[0];
        const value = parts.slice(1).join('='); // Handle values with =
        if (key && value) env[key.trim()] = value.trim();
    });

    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Missing credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(url, key);

    async function signUp() {
        console.log(`Attempting to sign up user Yeuri0692@gmail.com to ${url}...`);

        const { data, error } = await supabase.auth.signUp({
            email: 'Yeuri0692@gmail.com',
            password: 'Yeuri2606',
        });

        if (error) {
            console.log('User might already exist, attempting login...');
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: 'Yeuri0692@gmail.com',
                password: 'Yeuri2606',
            });

            if (loginError) {
                console.error('Error logging in:', loginError.message);
            } else {
                console.log('Login successful. User ID:', loginData.user.id);
                fs.writeFileSync('user_id.txt', loginData.user.id);
            }
        } else {
            console.log('User ID:', data.user ? data.user.id : 'User already exists or email confirmation required');
            if (data.user) {
                console.log('User created successfully.');
            }
        }
    }

    signUp();

} catch (err) {
    console.error('Error reading .env.local:', err.message);
}
