// Vercel serverless entry for NestJS
// Nest outputs to dist/src/, copied to api/dist/src/ by vercel-build

const handler = require('./dist/src/serverless').default;
module.exports = handler;
