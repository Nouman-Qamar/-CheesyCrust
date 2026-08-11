import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../store/CartContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Checkout() {
  const { lines, updateQuantity, subtotal, clearCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', delivery_address: '', notes: '' });
  const [payment, setPayment] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const placeOrder = async () => {
    setError('');
    if (!form.customer_name || !form.customer_phone || !form.delivery_address) {
      setError(t('requiredFieldsError'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        ...form,
        payment_type: payment,
        items: lines,
      });
      clearCart();
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || t('orderFailedError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('cartEmptyFull')}</p>
        <Link to="/" className="btn-brand" style={{ display: 'inline-block', marginTop: 12 }}>{t('viewMenu')}</Link>
      </div>
    );
  }

  const PAYMENT_OPTIONS = [['cod', t('cod')], ['easypaisa', t('easypaisa')], ['jazzcash', t('jazzcash')]];

  return (
    <div className="container" style={{ padding: '30px 20px 60px', maxWidth: 560 }}>
      <Link to="/" style={{ color: 'var(--brand)', fontSize: 14, fontWeight: 700 }}>← {t('backToMenu')}</Link>
      <h2 style={{ color: 'var(--brand)', margin: '16px 0' }}>{t('yourOrder')}</h2>

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        {lines.map((l) => (
          <div key={`${l.menu_item_id}-${l.variant_label}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{l.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.variant_label} · Rs {l.unit_price}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn-outline" style={{ padding: '2px 10px' }} onClick={() => updateQuantity(l.menu_item_id, l.variant_label, l.quantity - 1)}>−</button>
              <span>{l.quantity}</span>
              <button className="btn-outline" style={{ padding: '2px 10px' }} onClick={() => updateQuantity(l.menu_item_id, l.variant_label, l.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontWeight: 700 }}>
          <span>{t('subtotal')}</span><span>Rs {subtotal}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input placeholder={t('fullName')} value={form.customer_name} onChange={set('customer_name')} />
        <input placeholder={`${t('phoneNumber')} (03xx-xxxxxxx)`} value={form.customer_phone} onChange={set('customer_phone')} />
        <textarea placeholder={t('deliveryAddress')} rows={3} value={form.delivery_address} onChange={set('delivery_address')} />
        <textarea placeholder={t('orderNotesOptional')} rows={2} value={form.notes} onChange={set('notes')} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 8, color: 'var(--text-muted)', fontSize: 14 }}>{t('paymentMethod')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {PAYMENT_OPTIONS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPayment(val)}
              className="btn-outline"
              style={{ flex: 1, fontSize: 13, background: payment === val ? 'var(--brand)' : 'transparent', color: payment === val ? '#fff' : 'var(--brand)' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}

      <button className="btn-brand" style={{ width: '100%', fontSize: 16, padding: 14 }} onClick={placeOrder} disabled={submitting}>
        {submitting ? t('placingOrder') : `${t('placeOrder')} · Rs ${subtotal}`}
      </button>
    </div>
  );
}
