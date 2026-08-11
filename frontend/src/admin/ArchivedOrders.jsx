import { useEffect, useState } from 'react';
import { Table, Card, Button, Empty, message } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import api from '../api.js';

export default function ArchivedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/orders', { params: { archived: 'true' } }).then((res) => setOrders(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const restore = async (id) => {
    await api.put(`/orders/${id}/archive`, { archived: false });
    message.success('Order restored');
    load();
  };

  const columns = [
    { title: 'Order #', dataIndex: 'order_number' },
    { title: 'Customer', dataIndex: 'customer_name' },
    { title: 'Total', dataIndex: 'total_amount', render: (v) => `Rs ${v}` },
    { title: 'Date', dataIndex: 'createdAt', render: (v) => new Date(v).toLocaleDateString('en-PK') },
    {
      title: '',
      render: (_, record) => <Button icon={<UndoOutlined />} size="small" onClick={() => restore(record._id)}>Restore</Button>,
    },
  ];

  return (
    <Card title="Archived Orders">
      {orders.length === 0 && !loading
        ? <Empty description="No archived orders" />
        : <Table columns={columns} dataSource={orders} rowKey="_id" loading={loading} />}
    </Card>
  );
}
