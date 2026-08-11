import { useZoom, ZOOM_LEVELS } from '../i18n/useZoom.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

// dark: pass true when rendering on a dark antd surface (admin header) so
// button borders/text stay visible against it; the storefront already has
// its own dark CSS variables and doesn't need the override.
export default function DisplayControls({ dark = false }) {
  const { zoomKey, setZoomKey } = useZoom();
  const { lang, toggleLang } = useLanguage();

  const btnStyle = (active) => ({
    background: active ? 'var(--brand, #e0301e)' : 'transparent',
    color: active ? '#fff' : dark ? '#e5e5e5' : 'var(--text, #2b1810)',
    border: `1px solid ${dark ? '#444' : 'var(--border, #f0dfc9)'}`,
    borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700, lineHeight: 1,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {ZOOM_LEVELS.map((z) => (
          <button key={z.key} title={z.title} onClick={() => setZoomKey(z.key)} style={btnStyle(zoomKey === z.key)}>
            {z.label}
          </button>
        ))}
      </div>
      <button onClick={toggleLang} style={btnStyle(false)} title="Switch language">
        {lang === 'en' ? 'Roman Urdu' : 'English'}
      </button>
    </div>
  );
}
