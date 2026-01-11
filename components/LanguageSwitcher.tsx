import React from 'react';
import { useTranslation, Language } from '../context/LanguageContext';

const languages: { code: Language; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'ru', label: 'RU', name: 'Русский' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-2 py-1 rounded-md transition-all duration-200 ${language === lang.code ? 'bg-white bg-opacity-30 scale-110' : 'opacity-70 hover:opacity-100'}`}
          aria-label={`Switch to ${lang.name}`}
          title={lang.name}
        >
          <span className="text-sm font-semibold text-white">{lang.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
