import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import ReceiptPrint from '../components/ReceiptPrint.jsx';
import { RECEIPT_THEMES, getSavedThemeKey, saveThemeKey, getSavedLang, saveLang } from '../receiptThemes.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const STATUS_KEYS = {
  pending: 'statusPending',
  confirmed: 'statusConfirmed',
  preparing: 'statusPreparing',
  out_for_delivery: 'statusOutForDelivery',
  delivered: 'statusDelivered',
  cancelled: 'statusCancelled',
};

export default function OrderConfirmation() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [themeKey, setThemeKey] = useState(getSavedThemeKey());
  const [receiptLang, setReceiptLang] = useState(getSavedLang());

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch(() => setOrder(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (order === null) return <div className="container" style={{ padding: 60 }}>{t('loading')}</div>;
  if (order === false) return <div className="container" style={{ padding: 60 }}>{t('orderNotFound')}</div>;

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: 480, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>✅</div>
      <h2 style={{ color: 'var(--brand)' }}>{t('orderPlaced')}</h2>
      <p style={{ color: 'var(--text-muted)' }}>Order #{order.order_number}</p>

      <div className="card" style={{ padding: 16, margin: '20px 0', textAlign: 'left' }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('status')}: {t(STATUS_KEYS[order.status])}</div>
        {order.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}>
            <span>{it.quantity}× {it.name} ({it.variant_label})</span>
            <span>Rs {it.line_total}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <span>{t('total')}</span><span>Rs {order.total_amount}</span>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('delivery')}: {order.delivery_address}</p>

      <div className="no-print" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        <Link to="/" className="btn-brand">{t('orderMore')}</Link>
        <button className="btn-outline" onClick={() => setShowReceipt((v) => !v)}>
          {showReceipt ? t('hideReceipt') : t('viewReceipt')}
        </button>
      </div>

      {showReceipt && (
        <div style={{ marginTop: 24, textAlign: 'left' }}>
          <div className="no-print" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, justifyContent: 'center' }}>
            <select
              value={themeKey}
              onChange={(e) => { setThemeKey(e.target.value); saveThemeKey(e.target.value); }}
              style={{ width: 'auto' }}
            >
              {Object.entries(RECEIPT_THEMES).map(([key, theme]) => (
                <option key={key} value={key}>{theme.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              {['en', 'ur'].map((l) => (
                <button
                  key={l}
                  className="btn-outline"
                  style={{ fontSize: 13, background: receiptLang === l ? 'var(--brand)' : 'transparent', color: receiptLang === l ? '#fff' : 'var(--brand)' }}
                  onClick={() => { setReceiptLang(l); saveLang(l); }}
                >
                  {l === 'en' ? 'English' : 'اردو'}
                </button>
              ))}
            </div>
            <button className="btn-brand" onClick={handlePrint}>🖨 {t('printReceipt')}</button>
          </div>
          <ReceiptPrint order={order} themeKey={themeKey} lang={receiptLang} />
        </div>
      )}
    </div>
  );
}
