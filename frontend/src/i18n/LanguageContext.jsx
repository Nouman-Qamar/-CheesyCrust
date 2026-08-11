import { createContext, useContext, useState, useCallback } from 'react';
import { t as translate } from './translations.js';

const LanguageContext = createContext(null);

function getSaved() {
  return localStorage.getItem('cc_ui_lang') === 'ur' ? 'ur' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getSaved());

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'ur' : 'en';
      localStorage.setItem('cc_ui_lang', next);
      return next;
    });
  }, []);

  const t = useCallback((key) => translate(key, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
