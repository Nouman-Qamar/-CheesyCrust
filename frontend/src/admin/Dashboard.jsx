import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import api from '../api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [month, setMonth] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/reports/today').then((res) => setToday(res.data));
    api.get('/reports/summary').then((res) => setMonth(res.data));
  }, []);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>{t('today')}</h3>
      <Row gutter={16}>
        <Col span={6}>
          <Card><Statistic title={t('ordersToday')} value={today?.total_orders ?? '—'} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('revenueToday')} value={today?.total_revenue ?? '—'} prefix="Rs" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('expensesToday')} value={today?.total_expenses ?? '—'} prefix="Rs" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('netProfitToday')} value={today?.net_profit ?? '—'} prefix="Rs" valueStyle={{ color: (today?.net_profit ?? 0) >= 0 ? '#4caf6d' : '#e0555f' }} /></Card>
        </Col>
      </Row>

      <h3>{t('thisMonth')}</h3>
      <Row gutter={16}>
        <Col span={6}>
          <Card><Statistic title={t('totalOrders')} value={month?.total_orders ?? '—'} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('totalRevenue')} value={month?.total_revenue ?? '—'} prefix="Rs" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('totalExpenses')} value={month?.total_expenses ?? '—'} prefix="Rs" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('netProfit')} value={month?.net_profit ?? '—'} prefix="Rs" valueStyle={{ color: (month?.net_profit ?? 0) >= 0 ? '#4caf6d' : '#e0555f' }} /></Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card><Statistic title={t('grossProfit')} value={month?.total_profit ?? '—'} prefix="Rs" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('avgOrderValue')} value={month?.avg_order_value ? Math.round(month.avg_order_value) : '—'} prefix="Rs" /></Card>
        </Col>
      </Row>

      <Card title={t('topSellingItems')} style={{ marginTop: 20 }}>
        <Table
          dataSource={month?.top_items || []}
          rowKey="name"
          pagination={false}
          columns={[
            { title: 'Item', dataIndex: 'name' },
            { title: 'Qty Sold', dataIndex: 'qty' },
          ]}
        />
      </Card>

      {month?.total_cost === 0 && (
        <p style={{ color: '#b8adc0', marginTop: 12, fontSize: 13 }}>
          Profit shows Rs 0 until item costs are entered — set a "cost" per size in Menu → edit item, next to the price.
        </p>
      )}
    </div>
  );
}
