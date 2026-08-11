import { useState } from 'react';
import { Card, DatePicker, Button, Typography, message } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api.js';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function MonthlyReport() {
  const [range, setRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!range || range.length !== 2) {
      message.error('Pehle date range select karein');
      return;
    }
    setDownloading(true);
    try {
      const from = range[0].format('YYYY-MM-DD');
      const to = range[1].format('YYYY-MM-DD');
      const res = await api.get(`/reports/monthly?from=${from}&to=${to}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `CheesyCrust_Report_${from}_${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      message.error('Report download nahi ho saka');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card title="Monthly Report">
      <Text type="secondary">
        Select a date range and download a full Excel report — summary (revenue, cost, profit),
        item-wise sales, daily sales, repeat customers, and every order in that range.
      </Text>

      <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <RangePicker value={range} onChange={setRange} />
        <Button type="primary" icon={<FileExcelOutlined />} loading={downloading} onClick={download}>
          Download Excel Report
        </Button>
      </div>
    </Card>
  );
}
