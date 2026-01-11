import React from 'react';
import { useTranslation } from '../context/LanguageContext';

interface FooterProps {
    onShowPrivacy: () => void;
    onShowTerms: () => void;
    onShowCookies: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowPrivacy, onShowTerms, onShowCookies }) => {
    const { t } = useTranslation();

    return (
        <footer className="w-full max-w-2xl text-center text-gray-400 text-xs mt-8 pb-4">
            <div className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex justify-center space-x-4 mb-3">
                    <button onClick={onShowPrivacy} className="hover:underline hover:text-green-400">{t('footer.privacyPolicy')}</button>
                    <button onClick={onShowTerms} className="hover:underline hover:text-green-400">{t('footer.termsOfService')}</button>
                    <button onClick={onShowCookies} className="hover:underline hover:text-green-400">{t('footer.cookiePolicy')}</button>
                </div>
                <h4 className="font-bold text-sm text-gray-200">{t('footer.developer')}</h4>
                <p className="mt-1">{t('footer.feedback')} <a href="mailto:ip.apsardze24@gmail.com" className="text-green-400 hover:underline">ip.apsardze24@gmail.com</a></p>
                <div className="mt-1">
                    <a href="https://apsardze24.lv" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                        {t('footer.website')}
                    </a>
                    <span className="ml-2 text-gray-500">v1.05</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;