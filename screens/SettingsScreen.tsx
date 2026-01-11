import React, { useRef, useState } from 'react';
import { ColorTheme, GameState, ArtworkQuiz } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface AppConfig {
  boardSize: number;
  themeId: string;
  showHints: boolean;
  showNumbers: boolean;
}

interface SettingsScreenProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  themes: ColorTheme[];
  onStartGame: () => void;
  onReturnToGame: () => void;
  onStartWithImage: (imageUrl: string) => void;
  onStartRevealMode: (imageUrl: string, quizData: ArtworkQuiz) => void;
  gameState: GameState;
  totalScore: number;
}

interface ArtworkData {
    id: string;
    url: string;
}

const ART_DATA: ArtworkData[] = [
    { id: 'monaLisa', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/600px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' },
    { id: 'starryNight', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
    { id: 'pearlEarring', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/600px-1665_Girl_with_a_Pearl_Earring.jpg' },
    { id: 'birthOfVenus', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/600px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg' },
    { id: 'nightWatch', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/600px-The_Night_Watch_-_HD.jpg' },
    { id: 'theKiss', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/600px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' },
    { id: 'wanderer', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/600px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg' },
    { id: 'greatWave', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/600px-The_Great_Wave_off_Kanagawa.jpg' },
    { id: 'liberty', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Eug%C3%A8ne_Delacroix_-_La_Libert%C3%A9_guidant_le_peuple.jpg/600px-Eug%C3%A8ne_Delacroix_-_La_Libert%C3%A9_guidant_le_peuple.jpg' },
    { id: 'arnolfini', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/600px-Van_Eyck_-_Arnolfini_Portrait.jpg' },
    { id: 'americanGothic', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/600px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg' },
    { id: 'theScream', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/600px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg' },
    { id: 'laGrandeJatte', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/600px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg' },
    { id: 'persistenceOfMemory', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/The_Persistence_of_Memory.jpg/600px-The_Persistence_of_Memory.jpg' },
    { id: 'lasMeninas', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/600px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg' },
];

// Fix: Corrected the return type to include the 'url' property, matching the actual returned object structure.
const getArtworks = (t: (key: string) => any): (ArtworkQuiz & { url: string })[] => {
    return ART_DATA.map(art => {
        const options = t(`artworks.${art.id}.options`);
        return {
            url: art.url,
            correctTitle: t(`artworks.${art.id}.title`) as string,
            options: Array.isArray(options) && options.length === 4 ? options : ['Error', 'Loading', 'Options', '!'],
        };
    });
};


// A reusable toggle switch component
const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-gray-200">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`${
        enabled ? 'bg-green-500' : 'bg-gray-600'
      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200`}
      />
    </button>
  </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  config,
  setConfig,
  themes,
  onStartGame,
  onReturnToGame,
  onStartWithImage,
  onStartRevealMode,
  gameState,
  totalScore,
}) => {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isArtLoading, setIsArtLoading] = useState(false);
  const isLongLanguage = language === 'ru' || language === 'de';
  const isGameInProgress = gameState === GameState.IN_PROGRESS;

  const handleConfigChange = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onStartWithImage(imageUrl);
    }
  };

  const handleShareGame = async () => {
    const shareData = {
      title: t('app.title'),
      text: t('settings.howToPlayDescription'),
      url: 'http://knight.5plus.lv',
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleRandomArt = () => {
    setIsArtLoading(true);
    const artworks = getArtworks(t);
    const randomIndex = Math.floor(Math.random() * artworks.length);
    const artwork = artworks[randomIndex];

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Necessary for loading from another domain into a canvas
    img.src = artwork.url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // This case is very unlikely
        alert('Could not process image due to a browser issue.');
        setIsArtLoading(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      // Create a blob URL from the canvas. This "localizes" the image, avoiding security issues.
      canvas.toBlob((blob) => {
        if (blob) {
          const localUrl = URL.createObjectURL(blob);
          onStartRevealMode(localUrl, { correctTitle: artwork.correctTitle, options: artwork.options });
        } else {
          alert(t('settings.artError'));
          setIsArtLoading(false);
        }
      }, 'image/jpeg');
    };

    img.onerror = () => {
      // This triggers on network errors or if the image fails to load for any reason
      alert(t('settings.artError'));
      setIsArtLoading(false);
    };
  };


  return (
    <div className="w-full max-w-md mx-auto bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl shadow-lg text-white space-y-6">
      
      {/* Total Score Display */}
      <div className="text-center p-3 bg-gray-900/50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{t('settings.totalScore')}</h3>
        <p className="text-4xl font-bold text-yellow-400">{totalScore.toLocaleString(language)}</p>
      </div>

      {/* Board Size Setting */}
      <div>
        <label htmlFor="board-size" className="block text-lg font-medium text-gray-200 mb-2">
          {t('settings.boardSize')}: <span className="font-bold text-green-400">{config.boardSize}x{config.boardSize}</span>
        </label>
        <input
          type="range"
          id="board-size"
          min="5"
          max="12"
          value={config.boardSize}
          onChange={(e) => handleConfigChange('boardSize', parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <ToggleSwitch 
          label={t('settings.showHints')}
          enabled={config.showHints}
          onChange={(val) => handleConfigChange('showHints', val)}
        />
        <ToggleSwitch 
          label={t('settings.showNumbers')}
          enabled={config.showNumbers}
          onChange={(val) => handleConfigChange('showNumbers', val)}
        />
      </div>

      {/* Theme Selector */}
      <div>
          <label className="block text-lg font-medium text-gray-200 mb-2">{t('settings.theme')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map((theme) => {
                  const isRandomArt = theme.id === 'randomArt';
                  return (
                    <button
                      key={theme.id}
                      disabled={isArtLoading && isRandomArt}
                      onClick={() => {
                        if (isRandomArt) {
                           handleRandomArt();
                        } else {
                           handleConfigChange('themeId', theme.id)
                        }
                      }}
                      className={`p-2 rounded-lg text-center transition-all duration-200 ${config.themeId === theme.id && !isRandomArt ? 'ring-2 ring-green-400 scale-105' : 'bg-gray-600 hover:bg-gray-500'} ${isArtLoading && isRandomArt ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: config.themeId !== theme.id ? theme.darkSquare : theme.lightSquare }}
                    >
                      <span className="text-2xl">{theme.emoji}</span>
                      <span 
                        className="block text-xs font-semibold text-white"
                        style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)' }}
                      >
                          {isRandomArt && isArtLoading ? t('settings.loadingArt') : theme.name}
                      </span>
                    </button>
                  );
              })}
          </div>
      </div>
      
      {/* Start Button(s) */}
      {isGameInProgress ? (
        <div className="flex space-x-3">
          <button 
            onClick={onReturnToGame} 
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 ${isLongLanguage ? 'text-base' : 'text-lg'}`}
          >
            {t('settings.returnToGame')}
          </button>
          <button 
            onClick={onStartGame} 
            className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 ${isLongLanguage ? 'text-base' : 'text-lg'}`}
          >
            {t('settings.newGame')}
          </button>
        </div>
      ) : (
        <button 
          onClick={onStartGame} 
          className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 ${isLongLanguage ? 'text-lg' : 'text-xl'}`}
        >
          {t('settings.startGame')}
        </button>
      )}
      
      <div className="space-y-3 pt-4 border-t border-gray-600">
        <div className="flex space-x-3">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 text-base"
            >
              {t('settings.loadPhoto')}
            </button>
            <button 
              onClick={handleShareGame} 
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 text-base"
            >
              {t('settings.shareGame')}
            </button>
        </div>

        <div className="flex space-x-3">
            <a
              href="https://dice.5plus.lv"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 text-sm sm:text-base text-center"
            >
              {t('settings.diceWar')}
            </a>
            <a
              href="https://pdf.5plus.lv"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 transform hover:scale-105 text-sm sm:text-base text-center"
            >
              {t('settings.imagePdfTools')}
            </a>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="text-left pt-4 border-t border-gray-600">
          <h3 className="text-xl font-bold mb-2 text-green-400">{t('settings.howToPlay')}</h3>
          <p className="text-gray-300 text-sm">
              {t('settings.howToPlayDescription')}
          </p>
      </div>

    </div>
  );
};

export default SettingsScreen;