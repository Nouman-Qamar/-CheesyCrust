import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import StorefrontLayout from './layouts/StorefrontLayout.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';

import Menu from './pages/Menu.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';

import AdminLayout from './admin/AdminLayout.jsx';
import Login from './admin/Login.jsx';
import Dashboard from './admin/Dashboard.jsx';
import Orders from './admin/Orders.jsx';
import ArchivedOrders from './admin/ArchivedOrders.jsx';
import MenuManage from './admin/MenuManage.jsx';
import Stock from './admin/Stock.jsx';
import Expenses from './admin/Expenses.jsx';
import MonthlyReport from './admin/MonthlyReport.jsx';
import Settings from './admin/Settings.jsx';

function RequireAdmin({ children }) {
  const token = localStorage.getItem('cc_admin_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <Routes>
        {/* Customer-facing storefront — one CartProvider shared across all three pages */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
        </Route>

        {/* Admin panel — antd dark theme, login required */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm, token: { colorPrimary: '#e0301e' } }}>
                <AdminLayout />
              </ConfigProvider>
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="archived-orders" element={<ArchivedOrders />} />
          <Route path="menu" element={<MenuManage />} />
          <Route path="stock" element={<Stock />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="report" element={<MonthlyReport />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}

