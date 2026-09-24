// Vercel function for the REST API and the MCP endpoint; vercel.json routes /api/* and
// /mcp here. The app lives in packages/server/src/bin/vercel.ts, built before this runs.
import app from '../packages/server/dist/bin/vercel.js';

/** @param {Request} request */
const handle = (request) => app.fetch(request);

export { handle as DELETE, handle as GET, handle as HEAD, handle as OPTIONS, handle as POST };
