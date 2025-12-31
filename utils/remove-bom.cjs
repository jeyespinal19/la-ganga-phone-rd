const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
let content = fs.readFileSync(envPath, 'utf8');

if (content.charCodeAt(0) === 0xFEFF) {
    console.log('BOM detected! Removing...');
    content = content.slice(1);
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('BOM removed successfully.');
} else {
    console.log('No BOM detected.');
}
