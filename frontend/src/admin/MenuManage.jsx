import { useEffect, useState } from 'react';
import { Card, Table, Switch, Button, Modal, Form, Input, InputNumber, Select, Space, message, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '../api.js';

export default function MenuManage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form] = Form.useForm();
  const [catForm] = Form.useForm();

  const load = () => {
    setLoading(true);
    api.get('/menu/admin').then((res) => {
      setCategories(res.data.categories);
      setItems(res.data.items);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const catName = (id) => categories.find((c) => c._id === id)?.name || '—';

  const toggleAvailable = async (item, checked) => {
    await api.put(`/menu/items/${item._id}`, { is_available: checked });
    load();
  };

  const openNew = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ variants: [{ label: '', price: 0, cost: 0 }] });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    form.setFieldsValue({
      category_id: item.category_id,
      name: item.name,
      description: item.description,
      variants: item.variants,
    });
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    await api.delete(`/menu/items/${item._id}`);
    message.success('Item deleted');
    load();
  };

  const handleAddCategory = async () => {
    const values = await catForm.validateFields();
    const slug = values.slug || values.name.toLowerCase().trim().replace(/\s+/g, '-');
    await api.post('/menu/categories', { ...values, slug, display_order: categories.length });
    message.success('Category added');
    catForm.resetFields();
    setCatModalOpen(false);
    load();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.get('/menu/setup');
      message.success(res.data.message);
      load();
    } catch (err) {
      message.error(err.response?.data?.error || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.put(`/menu/items/${editing._id}`, values);
    } else {
      await api.post('/menu/items', values);
    }
    setModalOpen(false);
    load();
  };

  const columns = [
    { title: 'Category', dataIndex: 'category_id', render: catName },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Variants (price / cost)', dataIndex: 'variants', render: (v) => v.map(x => `${x.label}: Rs${x.price}${x.cost ? ` (cost Rs${x.cost})` : ''}`).join(' / ') },
    { title: 'Available', dataIndex: 'is_available', render: (val, item) => <Switch checked={val} onChange={(c) => toggleAvailable(item, c)} /> },
    {
      title: 'Actions',
      render: (_, item) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(item)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(item)} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Menu Items"
      extra={
        <Space>
          {categories.length === 0 && (
            <Button onClick={handleSeed} loading={seeding}>Seed Menu (from physical card)</Button>
          )}
          <Button onClick={() => setCatModalOpen(true)}>Categories</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openNew} disabled={categories.length === 0}>Add Item</Button>
        </Space>
      }
    >
      {categories.length === 0 && (
        <p style={{ color: '#b8adc0' }}>No categories yet — click "Seed Menu" above to load the real Cheesy Crust menu, or add a category manually.</p>
      )}
      <Table columns={columns} dataSource={items} rowKey="_id" loading={loading} />

      <Modal
        title={editing ? 'Edit Item' : 'Add Item'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
            <Select options={categories.map((c) => ({ value: c._id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 8, color: '#b8adc0' }}>Price Variants (size / weight) — cost is optional, only used for profit reports, never shown to customers</div>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item {...rest} name={[name, 'label']} rules={[{ required: true, message: 'Label' }]}>
                      <Input placeholder="e.g. Large, 1kg" />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'price']} rules={[{ required: true, message: 'Price' }]}>
                      <InputNumber placeholder="Sell price" min={0} />
                    </Form.Item>
                    <Form.Item {...rest} name={[name, 'cost']}>
                      <InputNumber placeholder="Cost (optional)" min={0} />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Add Variant
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="Add Category"
        open={catModalOpen}
        onOk={handleAddCategory}
        onCancel={() => setCatModalOpen(false)}
        okText="Add"
      >
        <Form form={catForm} layout="vertical">
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Desserts" />
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#b8adc0', marginBottom: 8 }}>Existing categories</div>
          {categories.map((c) => <Tag key={c._id} style={{ marginBottom: 6 }}>{c.name}</Tag>)}
        </div>
      </Modal>
    </Card>
  );
}
