// Vercel Serverless Function entry point
// This re-exports the Express app so Vercel can handle it as a serverless function.

import app from '../backend/src/index.js';

export default app;
