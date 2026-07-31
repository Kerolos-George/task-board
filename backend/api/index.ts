import type { VercelRequest, VercelResponse } from '@vercel/node';

// Built by `vercel-build` / `npm run build` before this function is bundled.
 // eslint-disable-next-line @typescript-eslint/no-require-imports
const handler = require('../dist/serverless').default;

export default function vercelHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
