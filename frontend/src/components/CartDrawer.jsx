import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function CartDrawer({ open, onClose }) {
  const { lines, updateQuantity, subtotal, itemCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease', zIndex: 40,
        }}
      />
      {/* panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(380px, 100%)',
          background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease', zIndex: 41,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{t('yourCart')} {itemCount > 0 && `(${itemCount})`}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
          {lines.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginTop: 30, textAlign: 'center' }}>
              {t('cartEmptyMsg')}
            </p>
          )}
          {lines.map((l) => (
            <div key={`${l.menu_item_id}-${l.variant_label}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.variant_label} · Rs {l.unit_price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => updateQuantity(l.menu_item_id, l.variant_label, l.quantity - 1)}
                  style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                  aria-label={l.quantity === 1 ? t('removeItem') : t('decreaseQty')}
                >
                  {l.quantity === 1 ? '🗑' : '−'}
                </button>
                <span style={{ minWidth: 18, textAlign: 'center' }}>{l.quantity}</span>
                <button
                  onClick={() => updateQuantity(l.menu_item_id, l.variant_label, l.quantity + 1)}
                  style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                  aria-label={t('increaseQty')}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 14 }}>
              <span>{t('subtotal')}</span><span>Rs {subtotal}</span>
            </div>
            <button
              className="btn-brand"
              style={{ width: '100%', padding: 12 }}
              onClick={() => { onClose(); navigate('/checkout'); }}
            >
              {t('checkoutBtn')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
