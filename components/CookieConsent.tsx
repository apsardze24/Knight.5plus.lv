import React from 'react';
import { useTranslation } from '../context/LanguageContext';

interface CookieConsentProps {
    onAccept: () => void;
    onDecline: () => void;
    onShowPolicy: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline, onShowPolicy }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm p-4 text-white z-50 animate-fade-in">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                <p className="text-sm text-gray-300 mb-4 sm:mb-0 sm:mr-4">
                    {t('cookieConsent.message')}{' '}
                    <button onClick={onShowPolicy} className="underline hover:text-green-400">
                        {t('footer.cookiePolicy')}
                    </button>
                </p>
                <div className="flex-shrink-0 flex space-x-3">
                    <button
                        onClick={onDecline}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        {t('cookieConsent.decline')}
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-green-500 hover:bg-green-600 transition-colors"
                    >
                        {t('cookieConsent.accept')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
