import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../store/CartContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import CartDrawer from './CartDrawer.jsx';
import DisplayControls from './DisplayControls.jsx';

export default function StoreHeader() {
  const { itemCount } = useCart();
  const { t } = useLanguage();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header style={{ borderBottom: '3px solid var(--brand)', padding: '14px 0', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 20 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 26 }}>🍕</span>
            <span className="display" style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand)' }}>Cheesy Crust</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <DisplayControls />
            <button
              onClick={() => setCartOpen(true)}
              style={{
                position: 'relative', background: 'var(--bg-card)', border: '1.5px solid var(--brand)',
                borderRadius: 999, padding: '8px 16px', color: 'var(--brand)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              🛒 {t('cart')}
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -8, right: -8, background: 'var(--brand)', color: '#fff',
                  borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
