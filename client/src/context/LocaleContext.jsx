import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'en');
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = dir;
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  function switchLanguage(l) {
    i18n.changeLanguage(l);
    setLang(l);
  }

  return (
    <LocaleContext.Provider value={{ lang, dir, switchLanguage }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
