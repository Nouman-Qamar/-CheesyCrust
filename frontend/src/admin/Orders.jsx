import { useEffect, useState } from 'react';
import { Table, Tag, Select, Card, Button, Modal, Space, Input, DatePicker, message, Switch } from 'antd';
import { PrinterOutlined, InboxOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../api.js';
import ReceiptPrint from '../components/ReceiptPrint.jsx';
import { RECEIPT_THEMES, getSavedThemeKey, saveThemeKey, getSavedLang, saveLang } from '../receiptThemes.js';

const { RangePicker } = DatePicker;

const STATUS_COLORS = {
  pending: 'gold', confirmed: 'blue', preparing: 'orange',
  out_for_delivery: 'purple', delivered: 'green', cancelled: 'red',
};
const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manageOrder, setManageOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [themeKey, setThemeKey] = useState(getSavedThemeKey());
  const [lang, setLang] = useState(getSavedLang());
  const [search, setSearch] = useState('');
  const [range, setRange] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (range && range.length === 2) {
      params.from = range[0].format('YYYY-MM-DD');
      params.to = range[1].format('YYYY-MM-DD');
    }
    api.get('/orders', { params }).then((res) => setOrders(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    load();
    if (manageOrder?._id === id) setManageOrder((o) => ({ ...o, status }));
  };

  const togglePaid = async (id, is_paid) => {
    await api.put(`/orders/${id}/paid`, { is_paid });
    load();
    if (manageOrder?._id === id) setManageOrder((o) => ({ ...o, is_paid }));
  };

  const archiveOrder = async (id) => {
    await api.put(`/orders/${id}/archive`, { archived: true });
    message.success('Order archived');
    setManageOrder(null);
    load();
  };

  const columns = [
    { title: 'Order #', dataIndex: 'order_number' },
    { title: 'Customer', dataIndex: 'customer_name' },
    { title: 'Phone', dataIndex: 'customer_phone' },
    { title: 'Items', dataIndex: 'items', render: (items) => items.map(i => `${i.quantity}× ${i.name} (${i.variant_label})`).join(', ') },
    { title: 'Total', dataIndex: 'total_amount', render: (v) => `Rs ${v}` },
    { title: 'Payment', dataIndex: 'payment_type', render: (v) => v.toUpperCase() },
    { title: 'Paid', dataIndex: 'is_paid', render: (v) => v ? <Tag color="green">Paid</Tag> : <Tag color="red">Unpaid</Tag> },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => setManageOrder(record)}>Manage</Button>
          <Button icon={<PrinterOutlined />} size="small" onClick={() => setPrintOrder(record)} />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Orders">
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Search name, phone, or order #"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={load}
          style={{ width: 260 }}
        />
        <RangePicker value={range} onChange={setRange} />
        <Button type="primary" onClick={load}>Search</Button>
      </Space>

      <Table columns={columns} dataSource={orders} rowKey="_id" loading={loading} />

      {/* Manage: kitchen status + payment-collected + archive, kept out of the
          table itself so the list stays scannable at a glance */}
      <Modal
        title={`Manage — ${manageOrder?.order_number || ''}`}
        open={!!manageOrder}
        onCancel={() => setManageOrder(null)}
        footer={null}
      >
        {manageOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ marginBottom: 6, color: '#b8adc0' }}>Kitchen Status</div>
              <Select
                value={manageOrder.status}
                style={{ width: '100%' }}
                onChange={(val) => updateStatus(manageOrder._id, val)}
                options={STATUS_OPTIONS.map((s) => ({ value: s, label: <Tag color={STATUS_COLORS[s]}>{s.replace(/_/g, ' ')}</Tag> }))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Payment Collected</span>
              <Switch checked={manageOrder.is_paid} onChange={(c) => togglePaid(manageOrder._id, c)} />
            </div>
            <Space>
              <Button icon={<PrinterOutlined />} onClick={() => { setPrintOrder(manageOrder); }}>Print Receipt</Button>
              <Button icon={<InboxOutlined />} danger onClick={() => archiveOrder(manageOrder._id)}>Archive Order</Button>
            </Space>
          </div>
        )}
      </Modal>

      <Modal
        title={`Receipt — ${printOrder?.order_number || ''}`}
        open={!!printOrder}
        onCancel={() => setPrintOrder(null)}
        footer={null}
        width={520}
      >
        {printOrder && (
          <>
            <Space className="no-print" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
              <Select
                value={themeKey}
                style={{ width: 160 }}
                onChange={(val) => { setThemeKey(val); saveThemeKey(val); }}
                options={Object.entries(RECEIPT_THEMES).map(([key, t]) => ({ value: key, label: t.label }))}
              />
              <Select
                value={lang}
                style={{ width: 110 }}
                onChange={(val) => { setLang(val); saveLang(val); }}
                options={[{ value: 'en', label: 'English' }, { value: 'ur', label: 'اردو' }]}
              />
              <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>
            </Space>
            <ReceiptPrint order={printOrder} themeKey={themeKey} lang={lang} />
          </>
        )}
      </Modal>
    </Card>
  );
}
