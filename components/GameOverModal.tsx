import React from 'react';
import { GameResult } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GameResult;
  onRestart: () => void;
  onGoToSettings: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  result,
  onRestart,
  onGoToSettings
}) => {
  const { t, language } = useTranslation();
  if (!isOpen) return null;

  const isLongLanguage = language === 'ru' || language === 'de';
  const buttonTextSize = isLongLanguage ? 'text-base' : 'text-lg';

  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 text-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 transform transition-all"
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing the modal
      >
        <h2 className="text-3xl font-bold text-center mb-4">
          {result.won ? `🎉 ${t('gameOver.winTitle')} 🎉` : t('gameOver.loseTitle')}
        </h2>
        <p className="text-center text-lg mb-2">
          {result.won ? t('gameOver.winMessage') : t('gameOver.loseMessage')}
        </p>
        <div className="text-center bg-gray-700 p-4 rounded-md mb-6">
            <p className="text-xl">{t('gameOver.yourScore')}</p>
            <p className="text-5xl font-bold text-green-400 my-2">{result.score} / {result.total}</p>
            <p className="text-md text-gray-300">({percentage}%)</p>
        </div>
        <div className="flex flex-col space-y-3">
          <button 
            onClick={onRestart}
            className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg ${buttonTextSize} transition-transform duration-200 transform hover:scale-105`}
          >
            {t('gameOver.playAgain')}
          </button>
          <button 
            onClick={onGoToSettings}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg ${buttonTextSize} transition-transform duration-200 transform hover:scale-105`}
          >
            {t('gameOver.changeSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;