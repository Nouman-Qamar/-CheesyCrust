import { Layout, Menu as AntMenu } from 'antd';
import { DashboardOutlined, ShoppingOutlined, AppstoreOutlined, LogoutOutlined, SettingOutlined, DatabaseOutlined, FileExcelOutlined, InboxOutlined, WalletOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import DisplayControls from '../components/DisplayControls.jsx';

const { Sider, Content, Header } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const items = [
    { key: '/admin', icon: <DashboardOutlined />, label: t('dashboard') },
    { key: '/admin/orders', icon: <ShoppingOutlined />, label: t('orders') },
    { key: '/admin/archived-orders', icon: <InboxOutlined />, label: t('archivedOrders') },
    { key: '/admin/menu', icon: <AppstoreOutlined />, label: t('menuNav') },
    { key: '/admin/stock', icon: <DatabaseOutlined />, label: t('rawMaterials') },
    { key: '/admin/expenses', icon: <WalletOutlined />, label: t('expenses') },
    { key: '/admin/report', icon: <FileExcelOutlined />, label: t('monthlyReport') },
    { key: '/admin/settings', icon: <SettingOutlined />, label: t('settings') },
    { key: 'logout', icon: <LogoutOutlined />, label: t('logout') },
  ];

  const handleClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('cc_admin_token');
      localStorage.removeItem('cc_admin_user');
      navigate('/admin/login');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: '#e0301e', fontWeight: 800, fontSize: 18, padding: 20 }}>Cheesy Crust</div>
        <AntMenu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={items} onClick={handleClick} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#e0301e', fontWeight: 600 }}>{t('adminPanel')}</span>
          <DisplayControls dark />
        </Header>
        <Content style={{ margin: 20 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
