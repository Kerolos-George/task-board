const path = require('path');
const fs = require('fs');

// Nest output is copied next to this file by `npm run vercel-build`
const candidates = [
  path.join(__dirname, 'dist', 'serverless.js'),
  path.join(__dirname, '..', 'dist', 'serverless.js'),
];

const serverlessPath = candidates.find((p) => fs.existsSync(p));

if (!serverlessPath) {
  console.error(
    'Nest serverless bundle not found. Looked in:\n' +
      candidates.map((p) => ` - ${p}`).join('\n') +
      '\nRun: npm run vercel-build',
  );
  throw new Error('Cannot find Nest serverless handler (api/dist/serverless.js)');
}

const handler = require(serverlessPath).default;

module.exports = handler;
