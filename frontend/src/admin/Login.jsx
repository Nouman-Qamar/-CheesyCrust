import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import DisplayControls from '../components/DisplayControls.jsx';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async ({ username, password }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/login', { username, password });
      localStorage.setItem('cc_admin_token', data.token);
      localStorage.setItem('cc_admin_user', JSON.stringify(data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: '#1c1620', gap: 20,
    }}>
      <DisplayControls dark />
      <div style={{
        width: '100%', maxWidth: 400, background: '#251c2b', borderRadius: 20,
        padding: '40px 32px', border: '1px solid #3a2f42',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title level={3} style={{ margin: 0, color: '#e0301e', fontWeight: 800 }}>Cheesy Crust</Title>
          <Text style={{ color: '#b8adc0', fontSize: 13.5 }}>{t('adminPanel')}</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 10 }} />}

        <Form onFinish={onFinish} layout="vertical" requiredMark={false} size="large">
          <Form.Item name="username" rules={[{ required: true, message: 'Enter username' }]}>
            <Input prefix={<UserOutlined />} placeholder={t('username')} style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('password')} style={{ borderRadius: 10 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 46, borderRadius: 10, fontWeight: 700 }}>
            {t('loginTitle')}
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Text style={{ color: '#6b6070', fontSize: 12 }}>Default: admin / admin123</Text>
        </div>
      </div>
    </div>
  );
}
