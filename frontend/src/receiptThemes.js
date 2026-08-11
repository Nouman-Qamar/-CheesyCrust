// src/receiptThemes.js
//
// Each key is a structurally distinct receipt TEMPLATE (header layout,
// spacing, borders) — not just a recolor. Adapted from HK Cables'
// invoiceThemes.js pattern, trimmed from 8 themes down to 4: the 3 dropped
// ones ("Estimate Classic/No-Brand/With-Color") were cable-trade specific
// (gauge visibility, hiding brand name) and don't map to a food order.
// ReceiptPrint.jsx picks a render layout based on this key; every theme
// renders the exact same order data, only structure/spacing/borders differ.

export const RECEIPT_THEMES = {
  modern: {
    label: 'Modern',
    blurb: 'Rounded cards, soft shadows — clean digital look for a printed A5/A4 receipt.',
    primary: '#b8860b',
    accentBg: '#fdf6e3',
    cardBg: '#fefaf0',
    border: '#e8d9b0',
    radius: 16,
  },
  classic: {
    label: 'Classic',
    blurb: 'Structured header bar, thin borders — familiar restaurant-bill look.',
    primary: '#4a2f14',
    accentBg: '#f5f0e6',
    cardBg: '#ffffff',
    border: '#c9b896',
    radius: 4,
  },
  minimal: {
    label: 'Minimal',
    blurb: 'No boxes, hairline dividers, black type, lots of whitespace.',
    primary: '#111827',
    accentBg: '#ffffff',
    cardBg: '#ffffff',
    border: '#e5e7eb',
    radius: 0,
  },
  slip: {
    label: 'Thermal Slip',
    blurb: 'Narrow 80mm receipt-printer style — dashed lines, quick print, no signatures.',
    primary: '#111827',
    accentBg: '#f9fafb',
    cardBg: '#f9fafb',
    border: '#9ca3af',
    radius: 0,
    isSlip: true,
  },
};

export const DEFAULT_THEME_KEY = 'slip';
export const DEFAULT_LANG = 'en';

export function getSavedThemeKey() {
  const saved = localStorage.getItem('cc_receipt_theme');
  return RECEIPT_THEMES[saved] ? saved : DEFAULT_THEME_KEY;
}
export function saveThemeKey(key) {
  localStorage.setItem('cc_receipt_theme', key);
}

export function getSavedLang() {
  const saved = localStorage.getItem('cc_receipt_lang');
  return saved === 'ur' ? 'ur' : DEFAULT_LANG;
}
export function saveLang(lang) {
  localStorage.setItem('cc_receipt_lang', lang);
}
