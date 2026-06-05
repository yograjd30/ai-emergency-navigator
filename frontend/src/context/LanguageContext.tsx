import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import en from '../i18n/en.json';

const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
};

type LangCode = keyof typeof SUPPORTED_LANGUAGES;

interface LanguageContextType {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: (key: string) => string;
  languages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  languages: SUPPORTED_LANGUAGES,
});

// Cache loaded translations
const translationCache: Record<string, Record<string, string>> = { en };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>(() => {
    const saved = localStorage.getItem('language') as LangCode;
    return saved && saved in SUPPORTED_LANGUAGES ? saved : 'en';
  });
  const [translations, setTranslations] = useState<Record<string, string>>(en);

  const setLanguage = useCallback(async (lang: LangCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    if (translationCache[lang]) {
      setTranslations(translationCache[lang]);
      return;
    }

    try {
      const module = await import(`../i18n/${lang}.json`);
      translationCache[lang] = module.default;
      setTranslations(module.default);
    } catch {
      // Fallback to English
      setTranslations(en);
    }
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key] || en[key as keyof typeof en] || key;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
