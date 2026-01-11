import React from 'react';
import { useTranslation } from '../context/LanguageContext';

interface LegalScreenProps {
  onBack: () => void;
}

const PrivacyPolicyScreen: React.FC<LegalScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl shadow-lg text-white animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-green-400">{t('legal.privacyTitle')}</h2>
      <p className="text-gray-300 whitespace-pre-line">{t('legal.privacyContent')}</p>
      <button 
        onClick={onBack}
        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105"
      >
        {t('legal.backButton')}
      </button>
    </div>
  );
};

export default PrivacyPolicyScreen;
