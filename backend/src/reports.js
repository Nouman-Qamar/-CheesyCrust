const express = require('express');
const ExcelJS = require('exceljs');
const router = express.Router();
const { Order } = require('./models/Order');
const { Expense } = require('./models/Expense');
const { requireAuth } = require('./auth');

function dateKey(d) {
  return new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
}

// Shared aggregation used by both the on-screen summary and the Excel export.
// Adds real profit (revenue - cost) on top of what HK Cables' own invoice
// reports ever tracked, since Cable invoices had no cost field at all.
function buildReportData(orders) {
  const total_orders = orders.length;
  let total_revenue = 0, total_cost = 0, total_delivery_fee = 0;

  const itemMap = {};     // "name|variant" -> { name, variant, qty, revenue, cost }
  const dayMap = {};      // date -> { orders, revenue, cost }
  const customerMap = {}; // "name|phone" -> { name, phone, orders, revenue }

  for (const o of orders) {
    total_revenue += o.total_amount || 0;
    total_delivery_fee += o.delivery_fee || 0;

    const dKey = dateKey(o.createdAt);
    if (!dayMap[dKey]) dayMap[dKey] = { orders: 0, revenue: 0, cost: 0 };
    dayMap[dKey].orders += 1;
    dayMap[dKey].revenue += o.total_amount || 0;

    const custKey = `${o.customer_name}|${o.customer_phone}`;
    if (!customerMap[custKey]) customerMap[custKey] = { name: o.customer_name, phone: o.customer_phone, orders: 0, revenue: 0 };
    customerMap[custKey].orders += 1;
    customerMap[custKey].revenue += o.total_amount || 0;

    for (const it of o.items) {
      const cost = (it.unit_cost || 0) * it.quantity;
      total_cost += cost;
      dayMap[dKey].cost += cost;

      const key = `${it.name}|${it.variant_label}`;
      if (!itemMap[key]) itemMap[key] = { name: it.name, variant: it.variant_label, qty: 0, revenue: 0, cost: 0 };
      itemMap[key].qty += it.quantity;
      itemMap[key].revenue += it.line_total || 0;
      itemMap[key].cost += cost;
    }
  }

  const itemSales = Object.values(itemMap)
    .map((i) => ({ ...i, profit: i.revenue - i.cost }))
    .sort((a, b) => b.revenue - a.revenue);

  const customerSales = Object.values(customerMap).sort((a, b) => b.revenue - a.revenue);

  const dayEntries = Object.entries(dayMap)
    .map(([date, v]) => ({ date, ...v, profit: v.revenue - v.cost }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const total_profit = total_revenue - total_cost;

  return {
    summary: {
      total_orders,
      total_revenue,
      total_cost,
      total_profit,
      total_delivery_fee,
      avg_order_value: total_orders ? total_revenue / total_orders : 0,
    },
    itemSales,
    customerSales,
    dailySales: dayEntries,
  };
}

async function fetchOrdersInRange(from, to) {
  const match = { archived: false, status: { $ne: 'cancelled' } };
  if (!from || !to) {
    const now = new Date();
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  }
  match.createdAt = { $gte: new Date(`${from}T00:00:00`), $lte: new Date(`${to}T23:59:59.999`) };
  const orders = await Order.find(match).sort({ createdAt: 1 });
  return { orders, from, to };
}

async function fetchExpensesInRange(from, to) {
  const expenses = await Expense.find({
    date: { $gte: new Date(`${from}T00:00:00`), $lte: new Date(`${to}T23:59:59.999`) },
  }).sort({ date: 1 });
  const total_expenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  return { expenses, total_expenses };
}

// GET /api/reports/summary?from=&to= — admin dashboard stats (also used for the "This Month" cards)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const { orders, from: f, to: t } = await fetchOrdersInRange(from, to);
    const data = buildReportData(orders);
    const { total_expenses } = await fetchExpensesInRange(f, t);
    const top_items = data.itemSales.slice(0, 5).map((i) => ({ name: `${i.name} (${i.variant})`, qty: i.qty }));
    res.json({
      ...data.summary,
      total_expenses,
      net_profit: data.summary.total_profit - total_expenses,
      top_items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/today — quick stats for "today" cards on the dashboard
router.get('/today', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { orders } = await fetchOrdersInRange(today, today);
    const data = buildReportData(orders);
    const { total_expenses } = await fetchExpensesInRange(today, today);
    res.json({ ...data.summary, total_expenses, net_profit: data.summary.total_profit - total_expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function buildExcel(data, orders, from, to, expenses, total_expenses) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Cheesy Crust';
  wb.created = new Date();

  const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB8860B' } };
  const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Summary sheet
  const s = wb.addWorksheet('Summary');
  s.columns = [{ width: 26 }, { width: 20 }];
  s.addRow([`Cheesy Crust — Monthly Report (${from} to ${to})`]).font = { bold: true, size: 14 };
  s.addRow([]);
  [
    ['Total Orders', data.summary.total_orders],
    ['Total Revenue', Math.round(data.summary.total_revenue)],
    ['Cost of Goods Sold', Math.round(data.summary.total_cost)],
    ['Gross Profit', Math.round(data.summary.total_profit)],
    ['Total Expenses', Math.round(total_expenses)],
    ['Net Profit', Math.round(data.summary.total_profit - total_expenses)],
    ['Delivery Fees Collected', Math.round(data.summary.total_delivery_fee)],
    ['Average Order Value', Math.round(data.summary.avg_order_value)],
  ].forEach((r) => { s.addRow(r).getCell(1).font = { bold: true }; });

  // Item-wise sales sheet
  const is = wb.addWorksheet('Item Sales');
  is.columns = [
    { header: 'Item', key: 'name', width: 26 },
    { header: 'Size', key: 'variant', width: 12 },
    { header: 'Qty Sold', key: 'qty', width: 12 },
    { header: 'Revenue', key: 'revenue', width: 14 },
    { header: 'Cost', key: 'cost', width: 14 },
    { header: 'Profit', key: 'profit', width: 14 },
  ];
  is.getRow(1).fill = HEADER_FILL; is.getRow(1).font = HEADER_FONT;
  data.itemSales.forEach((i) => is.addRow({ ...i, revenue: Math.round(i.revenue), cost: Math.round(i.cost), profit: Math.round(i.profit) }));

  // Daily sales sheet
  const ds = wb.addWorksheet('Daily Sales');
  ds.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Orders', key: 'orders', width: 12 },
    { header: 'Revenue', key: 'revenue', width: 14 },
    { header: 'Profit', key: 'profit', width: 14 },
  ];
  ds.getRow(1).fill = HEADER_FILL; ds.getRow(1).font = HEADER_FONT;
  data.dailySales.forEach((d) => ds.addRow({ date: d.date, orders: d.orders, revenue: Math.round(d.revenue), profit: Math.round(d.profit) }));

  // Repeat-customer sheet
  const cs = wb.addWorksheet('Customers');
  cs.columns = [
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Orders', key: 'orders', width: 12 },
    { header: 'Revenue', key: 'revenue', width: 14 },
  ];
  cs.getRow(1).fill = HEADER_FILL; cs.getRow(1).font = HEADER_FONT;
  data.customerSales.forEach((c) => cs.addRow({ ...c, revenue: Math.round(c.revenue) }));

  // Expenses sheet
  const es = wb.addWorksheet('Expenses');
  es.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Amount', key: 'amount', width: 14 },
  ];
  es.getRow(1).fill = HEADER_FILL; es.getRow(1).font = HEADER_FONT;
  expenses.forEach((e) => es.addRow({ date: dateKey(e.date), category: e.category, description: e.description, amount: e.amount }));

  // All orders sheet
  const ao = wb.addWorksheet('All Orders');
  ao.columns = [
    { header: 'Order #', key: 'order_number', width: 22 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Customer', key: 'customer_name', width: 22 },
    { header: 'Phone', key: 'customer_phone', width: 16 },
    { header: 'Payment', key: 'payment_type', width: 14 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Total', key: 'total_amount', width: 14 },
  ];
  ao.getRow(1).fill = HEADER_FILL; ao.getRow(1).font = HEADER_FONT;
  orders.forEach((o) => ao.addRow({
    order_number: o.order_number, date: dateKey(o.createdAt), customer_name: o.customer_name,
    customer_phone: o.customer_phone, payment_type: o.payment_type, status: o.status, total_amount: o.total_amount,
  }));

  return wb.xlsx.writeBuffer();
}

// GET /api/reports/monthly?from=&to= — Excel download with revenue/cost/profit/expenses breakdown
router.get('/monthly', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const { orders, from: f, to: t } = await fetchOrdersInRange(from, to);
    const data = buildReportData(orders);
    const { expenses, total_expenses } = await fetchExpensesInRange(f, t);
    const buffer = await buildExcel(data, orders, f, t, expenses, total_expenses);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="CheesyCrust_Report_${f}_${t}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Monthly report error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
