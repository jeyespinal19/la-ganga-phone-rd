const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('--- START ENV CONTENT ---');
console.log(envContent);
console.log('--- END ENV CONTENT ---');
