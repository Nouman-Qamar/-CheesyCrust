import { useState } from 'react';
import { Card, Radio, Space, Typography, Divider, Tabs, Form, Input, Button, Alert, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api.js';
import { RECEIPT_THEMES, getSavedThemeKey, saveThemeKey, getSavedLang, saveLang } from '../receiptThemes.js';

const { Text } = Typography;

function ReceiptSettings() {
  const [themeKey, setThemeKey] = useState(getSavedThemeKey());
  const [lang, setLang] = useState(getSavedLang());

  return (
    <>
      <Text type="secondary">
        Choose the default receipt template and language used when printing orders
        from the admin panel and shown to customers on their order confirmation page.
        Anyone can still switch it per-print — this is just the default.
      </Text>
      <Divider />
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 10, fontWeight: 600 }}>Receipt Template</div>
        <Radio.Group value={themeKey} onChange={(e) => { setThemeKey(e.target.value); saveThemeKey(e.target.value); }}>
          <Space direction="vertical">
            {Object.entries(RECEIPT_THEMES).map(([key, t]) => (
              <Radio key={key} value={key}>
                <strong>{t.label}</strong> — <Text type="secondary">{t.blurb}</Text>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
      <div>
        <div style={{ marginBottom: 10, fontWeight: 600 }}>Default Language</div>
        <Radio.Group value={lang} onChange={(e) => { setLang(e.target.value); saveLang(e.target.value); }}>
          <Radio value="en">English</Radio>
          <Radio value="ur">اردو (Urdu)</Radio>
        </Radio.Group>
      </div>
    </>
  );
}

function AccountSettings() {
  const [pwForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [pwError, setPwError] = useState('');
  const [userError, setUserError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const changePassword = async (values) => {
    setPwLoading(true);
    setPwError('');
    try {
      await api.put('/auth/change-password', { current_password: values.current_password, new_password: values.new_password });
      message.success('Password changed');
      pwForm.resetFields();
    } catch (err) {
      setPwError(err.response?.data?.error || 'Could not change password');
    } finally {
      setPwLoading(false);
    }
  };

  const changeUsername = async (values) => {
    setUserLoading(true);
    setUserError('');
    try {
      const { data } = await api.put('/auth/change-username', { current_password: values.current_password, new_username: values.new_username });
      localStorage.setItem('cc_admin_user', JSON.stringify(data.user));
      message.success('Username changed');
      userForm.resetFields();
    } catch (err) {
      setUserError(err.response?.data?.error || 'Could not change username');
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Change Password</div>
        {pwError && <Alert message={pwError} type="error" showIcon style={{ marginBottom: 12 }} />}
        <Form form={pwForm} layout="vertical" onFinish={changePassword}>
          <Form.Item name="current_password" rules={[{ required: true, message: 'Enter current password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
          </Form.Item>
          <Form.Item name="new_password" rules={[{ required: true, min: 4, message: 'At least 4 characters' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="New password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={pwLoading}>Update Password</Button>
        </Form>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Change Username</div>
        {userError && <Alert message={userError} type="error" showIcon style={{ marginBottom: 12 }} />}
        <Form form={userForm} layout="vertical" onFinish={changeUsername}>
          <Form.Item name="new_username" rules={[{ required: true, message: 'Enter new username' }]}>
            <Input prefix={<UserOutlined />} placeholder="New username" />
          </Form.Item>
          <Form.Item name="current_password" rules={[{ required: true, message: 'Confirm with current password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={userLoading}>Update Username</Button>
        </Form>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <Card title="Settings">
      <Tabs
        items={[
          { key: 'receipt', label: 'Receipt', children: <ReceiptSettings /> },
          { key: 'account', label: 'Account', children: <AccountSettings /> },
        ]}
      />
    </Card>
  );
}
