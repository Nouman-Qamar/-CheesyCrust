import { useEffect, useRef, useState } from 'react';
import api from '../api.js';
import { useCart } from '../store/CartContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const CATEGORY_ICONS = {
  pizza: '🍕', 'chef-special': '⭐', pastas: '🍝', 'spine-roll': '🌯',
  'extra-topping': '➕', jalebi: '🍩', drinks: '🥤',
};

// Cycled per category so the card "media" strip isn't one flat color across
// the whole menu — still entirely within the brand palette (red/orange/
// cheese-yellow) plus a couple of accent tones for variety between sections.
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #e0301e, #f77f00)',
  'linear-gradient(135deg, #f77f00, #ffb703)',
  'linear-gradient(135deg, #c62828, #e0301e)',
  'linear-gradient(135deg, #ffb703, #ff5c3d)',
  'linear-gradient(135deg, #2e7d4f, #6fae63)',
  'linear-gradient(135deg, #7b3fe4, #e0301e)',
];

// If every item in a category shares the exact same size labels + prices
// (true for the Pizza section), that price ladder is a property of the
// CATEGORY, not of each pizza — showing it once instead of on every card
// removes a lot of repeated "S · Rs499  M · Rs899  L · Rs1299  XL · Rs1699"
// text that added no new information per item.
function sameVariants(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v.label === b[i].label && v.price === b[i].price);
}
function detectSharedVariants(items) {
  if (items.length < 2) return null;
  const first = items[0].variants;
  return items.every((it) => sameVariants(it.variants, first)) ? first : null;
}

function VariantChip({ item, variant }) {
  const { lines, addItem, updateQuantity } = useCart();
  const line = lines.find((l) => l.menu_item_id === item._id && l.variant_label === variant.label);

  if (line) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand)',
        borderRadius: 999, padding: '3px 6px', border: '1px solid var(--brand)',
      }}>
        <button onClick={() => updateQuantity(item._id, variant.label, line.quantity - 1)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, width: 18 }}>−</button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: 'center' }}>{line.quantity}</span>
        <button onClick={() => updateQuantity(item._id, variant.label, line.quantity + 1)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, width: 18 }}>+</button>
      </div>
    );
  }

  return (
    <button onClick={() => addItem(item, variant)} className="btn-outline" style={{ fontSize: 12.5, padding: '5px 10px' }}>
      {variant.label}{variant.price ? ` · Rs ${variant.price}` : ''}
    </button>
  );
}

function ItemCard({ item, hideVariantPrices, gradient }) {
  return (
    <div className="menu-card">
      <div className="menu-card-media" style={!item.image_url ? { background: gradient } : undefined}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} />
          : <span>{CATEGORY_ICONS[item._categorySlug] || '🍽'}</span>}
      </div>
      <div className="menu-card-body">
        <div className="menu-card-name">{item.name}</div>
        {item.description && <div className="menu-card-desc">{item.description}</div>}
        <div className="menu-card-variants">
          {item.variants.map((v) => (
            <VariantChip
              key={v.label}
              item={item}
              variant={hideVariantPrices ? { ...v, price: 0 } : v}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, items, gradient, sectionRef }) {
  const shared = detectSharedVariants(items);
  const { t } = useLanguage();

  return (
    <section id={`cat-${category.slug}`} ref={sectionRef} style={{ marginBottom: 40, scrollMarginTop: 96 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[category.slug] || '🍽'}</span>
        <h2 style={{ color: 'var(--brand)', fontSize: 22, margin: 0 }}>{category.name}</h2>
      </div>
      {shared && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginBottom: 12 }}>
          {t('sizes')}: {shared.map((v) => `${v.label} · Rs ${v.price}`).join('  ·  ')}
        </div>
      )}
      <div className="menu-card-grid" style={{ marginTop: shared ? 0 : 12 }}>
        {items.map((item) => (
          <ItemCard
            key={item._id}
            item={{ ...item, _categorySlug: category.slug }}
            hideVariantPrices={!!shared}
            gradient={gradient}
          />
        ))}
      </div>
    </section>
  );
}

export default function Menu() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState(null);
  const { t } = useLanguage();
  const sectionRefs = useRef({});

  useEffect(() => {
    api.get('/menu').then((res) => {
      setGroups(res.data);
      const first = res.data.find((g) => g.items.length > 0);
      if (first) setActiveSlug(first.category.slug);
    }).finally(() => setLoading(false));
  }, []);

  // Scroll-spy: highlight whichever category's section is nearest the top
  // of the viewport as the user scrolls, so the sidebar stays in sync
  // whether they clicked a category or just scrolled the page themselves.
  useEffect(() => {
    const visibleGroups = groups.filter((g) => g.items.length > 0);
    if (!visibleGroups.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          const slug = top.target.id.replace('cat-', '');
          setActiveSlug(slug);
        }
      },
      { rootMargin: '-110px 0px -65% 0px', threshold: 0 }
    );
    visibleGroups.forEach((g) => {
      const el = sectionRefs.current[g.category.slug];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [groups]);

  const goToCategory = (slug) => {
    setActiveSlug(slug);
    const el = sectionRefs.current[slug];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const visibleGroups = groups.filter(({ items }) => items.length > 0);

  return (
    <div>
      <div style={{ padding: '30px 0 6px', textAlign: 'center' }}>
        <div className="container">
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('storeTagline')}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{t('freeDelivery')}</div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        {loading && <p style={{ color: 'var(--text-muted)' }}>{t('loadingMenu')}</p>}
        {!loading && visibleGroups.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>{t('menuEmpty')}</p>
        )}

        {!loading && visibleGroups.length > 0 && (
          <div className="menu-layout">
            <nav className="menu-sidebar">
              {visibleGroups.map(({ category }) => (
                <button
                  key={category._id}
                  className={`menu-sidebar-btn${activeSlug === category.slug ? ' active' : ''}`}
                  onClick={() => goToCategory(category.slug)}
                >
                  <span>{CATEGORY_ICONS[category.slug] || '🍽'}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </nav>

            <div className="menu-content">
              {visibleGroups.map(({ category, items }, i) => (
                <CategorySection
                  key={category._id}
                  category={category}
                  items={items}
                  gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                  sectionRef={(el) => { sectionRefs.current[category.slug] = el; }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
