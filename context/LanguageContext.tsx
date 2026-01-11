
import React, { createContext, useState, useContext, useEffect, useCallback, PropsWithChildren } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<Language, any> | null>(null);
  
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const responses = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/es.json'),
          fetch('/locales/fr.json'),
          fetch('/locales/de.json'),
          fetch('/locales/ru.json'),
        ]);

        const data = await Promise.all(responses.map(res => res.json()));
        
        setTranslations({
          en: data[0],
          es: data[1],
          fr: data[2],
          de: data[3],
          ru: data[4],
        });
      } catch (error) {
        console.error("Failed to load translations:", error);
      }
    };

    fetchTranslations();
  }, []);

  const t = useCallback((key: string): any => {
    if (!translations) {
      return key;
    }
    
    const keys = key.split('.');
    
    const findTranslation = (lang: Language): any | null => {
        let current: any = translations[lang];
        if (!current) return null;

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return null;
            }
        }
        return current;
    };

    let translation = findTranslation(language);
    
    if (translation === null && language !== 'en') {
        translation = findTranslation('en');
    }

    return translation ?? key;
  }, [language, translations]);

  if (!translations) {
    return (
      <div className="bg-gray-800 min-h-screen w-full flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
