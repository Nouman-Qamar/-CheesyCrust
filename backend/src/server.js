// Local dev / traditional hosting entry point. Vercel does NOT use this
// file — it uses api/index.js instead, which imports the same app from
// ./app.js so both environments run identical route logic.
const app = require('./app');

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 5000}`);
});
