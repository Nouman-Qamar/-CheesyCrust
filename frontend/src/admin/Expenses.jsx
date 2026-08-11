import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Space, message, Typography, Statistic } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api.js';

const { Text } = Typography;

const CATEGORIES = ['ingredients', 'gas', 'staff', 'rent', 'utilities', 'maintenance', 'other'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/expenses').then((res) => setExpenses(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const openNew = () => {
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), category: 'ingredients' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    await api.post('/expenses', { ...values, date: values.date.toISOString() });
    message.success('Expense added');
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    load();
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', render: (v) => new Date(v).toLocaleDateString('en-PK') },
    { title: 'Category', dataIndex: 'category', render: (v) => v[0].toUpperCase() + v.slice(1) },
    { title: 'Description', dataIndex: 'description' },
    { title: 'Amount', dataIndex: 'amount', render: (v) => `Rs ${v}` },
    {
      title: '',
      render: (_, e) => <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(e._id)} />,
    },
  ];

  return (
    <Card
      title="Expenses"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openNew}>Add Expense</Button>}
    >
      <Text type="secondary">
        Ingredient purchases, gas, staff wages, rent — logging these here is what turns "gross profit"
        (revenue minus item cost) into real Net Profit on the Dashboard and Monthly Report.
      </Text>

      <Statistic title="Total (all logged expenses)" value={total} prefix="Rs" style={{ margin: '20px 0' }} />

      <Table columns={columns} dataSource={expenses} rowKey="_id" loading={loading} />

      <Modal title="Add Expense" open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} okText="Save">
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input placeholder="e.g. Flour + sugar purchase" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
