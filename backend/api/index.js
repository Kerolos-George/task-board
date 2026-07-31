// Vercel serverless entry for NestJS
// The dist folder is copied here by npm run vercel-build

const path = require('path');
const fs = require('fs');

const distPath = path.join(__dirname, 'dist', 'serverless.js');

if (!fs.existsSync(distPath)) {
  const files = fs.readdirSync(__dirname, { recursive: true });
  console.error('Files in api/:', files);
  throw new Error(`Nest bundle not found at: ${distPath}`);
}

const handler = require('./dist/serverless').default;
module.exports = handler;
