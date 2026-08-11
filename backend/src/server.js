require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

const menuRouter = require('./menu');
const ordersRouter = require('./orders');
const reportsRouter = require('./reports');
const expensesRouter = require('./expenses');
const materialsRouter = require('./materials');
const { router: authRouter, ensureDefaultAdmin } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

connectDB().then(async () => {
  console.log('Database ready');
  await ensureDefaultAdmin(); // seeds admin/admin123 if no users exist yet
}).catch(err => console.error(err));

app.use('/api', authRouter);          // POST /api/login
app.use('/api/menu', menuRouter);     // public menu + admin menu CRUD
app.use('/api/orders', ordersRouter); // public order placement + admin order management
app.use('/api/reports', reportsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/materials', materialsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Cheesy Crust API is running' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 5000}`);
});
