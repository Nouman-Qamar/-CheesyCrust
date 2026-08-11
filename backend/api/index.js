// Vercel serverless entry point. Vercel treats every file under /api as
// its own serverless function; exporting the Express app directly here
// lets Vercel's Node runtime call it like a request handler.
module.exports = require('../src/app');
