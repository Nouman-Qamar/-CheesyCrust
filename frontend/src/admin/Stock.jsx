import { useEffect, useState } from 'react';
import { Card, Table, InputNumber, Button, Typography, message, Space, Tag, Modal, Form, Input, Select, Popover, List } from 'antd';
import { PlusOutlined, ShoppingCartOutlined, MinusOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api.js';

const { Text } = Typography;
const UNITS = ['kg', 'g', 'liter', 'ml', 'piece', 'dozen', 'packet', 'bag'];

export default function Stock() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [purchaseFor, setPurchaseFor] = useState(null);
  const [useFor, setUseFor] = useState(null);
  const [newForm] = Form.useForm();
  const [purchaseForm] = Form.useForm();
  const [useForm] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/materials').then((res) => setMaterials(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    newForm.resetFields();
    newForm.setFieldsValue({ unit: 'kg' });
    setNewModalOpen(true);
  };

  const handleAddMaterial = async () => {
    const values = await newForm.validateFields();
    await api.post('/materials', values);
    message.success('Material added');
    setNewModalOpen(false);
    load();
  };

  const handleDeleteMaterial = async (id) => {
    await api.delete(`/materials/${id}`);
    load();
  };

  const openPurchase = (material) => {
    purchaseForm.resetFields();
    setPurchaseFor(material);
  };

  const handlePurchase = async () => {
    const values = await purchaseForm.validateFields();
    await api.post(`/materials/${purchaseFor._id}/purchase`, values);
    message.success(`${purchaseFor.name}: +${values.quantity}${purchaseFor.unit} added`);
    setPurchaseFor(null);
    load();
  };

  const openUse = (material) => {
    useForm.resetFields();
    setUseFor(material);
  };

  const handleUse = async () => {
    const values = await useForm.validateFields();
    await api.post(`/materials/${useFor._id}/use`, values);
    message.success(`${useFor.name}: -${values.quantity}${useFor.unit} recorded`);
    setUseFor(null);
    load();
  };

  const columns = [
    { title: 'Material', dataIndex: 'name' },
    {
      title: 'Current Stock',
      render: (_, m) => {
        const low = m.low_stock_threshold > 0 && m.quantity_on_hand <= m.low_stock_threshold;
        return <Tag color={m.quantity_on_hand === 0 ? 'red' : low ? 'orange' : 'green'}>{m.quantity_on_hand} {m.unit}</Tag>;
      },
    },
    {
      title: 'Purchase History',
      render: (_, m) => (
        <Popover
          title={`${m.name} — recent purchases`}
          content={
            m.purchases?.length
              ? <List size="small" dataSource={m.purchases.slice(0, 8)} renderItem={(p) => (
                  <List.Item>
                    {new Date(p.date).toLocaleDateString('en-PK')}: +{p.quantity}{m.unit} {p.cost ? `(Rs ${p.cost})` : ''} {p.note ? `— ${p.note}` : ''}
                  </List.Item>
                )} />
              : <Text type="secondary">No purchases logged yet</Text>
          }
        >
          <Button icon={<HistoryOutlined />} size="small">{m.purchases?.length || 0}</Button>
        </Popover>
      ),
    },
    {
      title: 'Actions',
      render: (_, m) => (
        <Space>
          <Button icon={<ShoppingCartOutlined />} size="small" type="primary" onClick={() => openPurchase(m)}>Purchase</Button>
          <Button icon={<MinusOutlined />} size="small" onClick={() => openUse(m)}>Use</Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeleteMaterial(m._id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Raw Materials"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openNew}>Add Material</Button>}
    >
      <Text type="secondary">
        Ingredients you buy — flour, cheese, chicken, sugar, oil etc. This is separate from the
        menu: it doesn't auto-deduct when a customer orders a pizza. Log a purchase whenever you
        buy more; log "Use" for wastage or kitchen consumption you want to record manually.
      </Text>

      <div style={{ marginTop: 16 }}>
        {materials.length === 0 && !loading && (
          <p style={{ color: '#b8adc0' }}>No raw materials added yet — click "Add Material" to start (e.g. Flour, Mozzarella, Chicken).</p>
        )}
        <Table columns={columns} dataSource={materials} rowKey="_id" loading={loading} />
      </div>

      <Modal title="Add Raw Material" open={newModalOpen} onOk={handleAddMaterial} onCancel={() => setNewModalOpen(false)} okText="Add">
        <Form form={newForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Flour, Mozzarella Cheese, Chicken" />
          </Form.Item>
          <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
            <Select options={UNITS.map((u) => ({ value: u, label: u }))} />
          </Form.Item>
          <Form.Item name="quantity_on_hand" label="Starting Quantity (optional)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="low_stock_threshold" label="Low Stock Alert Below (optional)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`Log Purchase — ${purchaseFor?.name || ''}`} open={!!purchaseFor} onOk={handlePurchase} onCancel={() => setPurchaseFor(null)} okText="Add to Stock">
        <Form form={purchaseForm} layout="vertical">
          <Form.Item name="quantity" label={`Quantity purchased (${purchaseFor?.unit || ''})`} rules={[{ required: true }]}>
            <InputNumber min={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cost" label="Total cost paid (optional)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Note (optional)">
            <Input placeholder="e.g. supplier name" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`Record Usage — ${useFor?.name || ''}`} open={!!useFor} onOk={handleUse} onCancel={() => setUseFor(null)} okText="Deduct">
        <Form form={useForm} layout="vertical">
          <Form.Item name="quantity" label={`Quantity used/wasted (${useFor?.unit || ''})`} rules={[{ required: true }]}>
            <InputNumber min={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
