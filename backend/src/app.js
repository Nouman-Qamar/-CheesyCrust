// Express app setup, separated from server.js so the SAME app can be:
//  - started with app.listen() for local dev / traditional hosting (server.js)
//  - exported directly as a serverless handler for Vercel (api/index.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const { ensureDefaultAdmin } = require('./auth');

const menuRouter = require('./menu');
const ordersRouter = require('./orders');
const reportsRouter = require('./reports');
const expensesRouter = require('./expenses');
const materialsRouter = require('./materials');
const { router: authRouter } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

// On every cold start (serverless) or once at boot (traditional server),
// make sure we're connected before handling requests that need the DB.
// connectDB() caches the connection, so repeated calls on warm invocations
// are cheap no-ops.
let readyPromise = null;
function ensureReady() {
  if (!readyPromise) {
    readyPromise = connectDB()
      .then(() => ensureDefaultAdmin())
      .catch((err) => {
        readyPromise = null; // allow retry on next request if it failed
        throw err;
      });
  }
  return readyPromise;
}

// Liveness check — deliberately registered BEFORE the DB-readiness gate so
// it always responds instantly, even if MongoDB is unreachable. Useful for
// confirming the deployment itself is up before worrying about the DB.
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Cheesy Crust API is running' });
});

app.use(async (req, res, next) => {
  try {
    await ensureReady();
    next();
  } catch (err) {
    console.error('DB not ready:', err.message);
    res.status(503).json({ error: 'Database unavailable, please try again shortly.' });
  }
});

app.use('/api', authRouter);          // POST /api/login
app.use('/api/menu', menuRouter);     // public menu + admin menu CRUD
app.use('/api/orders', ordersRouter); // public order placement + admin order management
app.use('/api/reports', reportsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/materials', materialsRouter);

module.exports = app;
