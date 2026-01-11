
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GameScreen from './screens/GameScreen';
import SettingsScreen from './screens/SettingsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import CookiePolicyScreen from './screens/CookiePolicyScreen';
import { ColorTheme, BoardState, Position, GameState, LegalScreen, ArtworkQuiz } from './types';
import { useTranslation } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';

const THEMES_DATA: Omit<ColorTheme, 'name'>[] = [
  {
    id: 'classic',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    visitedLight: '#cdd26a',
    visitedDark: '#aaa23a',
    current: '#6495ED',
    possible: 'rgba(0, 255, 0, 0.4)',
    textPrimary: '#333333',
    textSecondary: '#ffffff',
    emoji: '♞',
  },
  {
    id: 'savePlanet',
    lightSquare: '#b8b0a5', // Растрескавшаяся коричнево-серая земля
    darkSquare: '#968c81',  // Темная сухая почва
    visitedLight: '#81c784', // Проросшая трава
    visitedDark: '#388e3c',  // Цветущий сад
    current: '#2e7d32',
    possible: 'rgba(255, 255, 255, 0.6)',
    textPrimary: '#1b5e20',
    textSecondary: '#ffffff',
    emoji: '🌲',
  },
  {
    id: 'pollutePlanet',
    lightSquare: '#a5d6a7', // Чистая зелень
    darkSquare: '#81c784',  // Чистая зелень
    visitedLight: '#5a5a5a', // Грязный серый налет
    visitedDark: '#333333',  // Угольная пустошь
    current: '#000000',
    possible: 'rgba(255, 235, 59, 0.5)',
    textPrimary: '#eeeeee',
    textSecondary: '#ffffff',
    emoji: '💩',
  },
  {
    id: 'randomArt',
    lightSquare: '#7B68EE', 
    darkSquare: '#5D3FD3', 
    visitedLight: '#cdd26a',
    visitedDark: '#aaa23a',
    current: '#6495ED',
    possible: 'rgba(0, 255, 0, 0.4)',
    textPrimary: '#ffffff',
    textSecondary: '#ffffff',
    emoji: '🎨',
  },
];

const APP_CONFIG_KEY = 'knightsTourConfig';
const COOKIE_CONSENT_KEY = 'knightsTourCookieConsent';
const TOTAL_SCORE_KEY = 'knightsTourTotalScore';


interface AppConfig {
  boardSize: number;
  themeId: string;
  showHints: boolean;
  showNumbers: boolean;
}

const getDefaultConfig = (): AppConfig => ({
  boardSize: 8,
  themeId: THEMES_DATA[0].id,
  showHints: true,
  showNumbers: true,
});

const getEnglishThemeNameMap = () => {
  const map: Record<string, string> = {
    'Classic': 'classic',
    'Save Planet': 'savePlanet',
    'Pollute Planet': 'pollutePlanet',
  };
  return map;
}

const KNIGHT_MOVES = [
  { row: -2, col: -1 }, { row: -2, col: 1 },
  { row: -1, col: -2 }, { row: -1, col: 2 },
  { row: 1, col: -2 }, { row: 1, col: 2 },
  { row: 2, col: -1 }, { row: 2, col: 1 },
];

const createEmptyBoard = (size: number): BoardState => {
  return Array(size).fill(null).map(() => Array(size).fill(0));
};

const App: React.FC = () => {
  const { t, language } = useTranslation();
  
  const themes: ColorTheme[] = useMemo(() => {
    return THEMES_DATA.map(theme => ({
      ...theme,
      name: t(`themes.${theme.id}`)
    }));
  }, [t]);

  const [screen, setScreen] = useState<'settings' | 'game'>('settings');
  const [legalScreen, setLegalScreen] = useState<LegalScreen>(null);
  const [cookieConsent, setCookieConsent] = useState<'given' | 'declined' | 'pending'>('pending');

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const savedConfig = localStorage.getItem(APP_CONFIG_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        let themeId = parsed.themeId;

        if (themeId === 'tyranny') {
            themeId = THEMES_DATA[0].id;
        }

        if (!themeId) {
          const oldThemeName = (parsed.colorTheme || parsed.theme)?.name;
          if (oldThemeName) {
            const themeNameMap = getEnglishThemeNameMap();
            themeId = themeNameMap[oldThemeName] || THEMES_DATA[0].id;
          }
        }
        
        const { theme, colorTheme, ...restOfParsed } = parsed;
        return { ...getDefaultConfig(), ...restOfParsed, themeId: themeId || THEMES_DATA[0].id };
      }
    } catch (error) {
      console.error("Failed to parse config from localStorage", error);
    }
    return getDefaultConfig();
  });
  
  const currentColorTheme = useMemo(() => themes.find(t => t.id === config.themeId) || themes[0], [themes, config.themeId]);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.NOT_STARTED);
  const [boardState, setBoardState] = useState<BoardState>(() => createEmptyBoard(config.boardSize));
  const [currentPos, setCurrentPos] = useState<Position | null>(null);
  const [moveHistory, setMoveHistory] = useState<Position[]>([]);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [revealImage, setRevealImage] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);

  
  // Artwork Quiz State
  const [artworkQuiz, setArtworkQuiz] = useState<ArtworkQuiz | null>(null);
  const [isArtworkGuessed, setIsArtworkGuessed] = useState<boolean>(false);
  const [guessBonusStartScore, setGuessBonusStartScore] = useState<number>(0);
  const [bonusPoints, setBonusPoints] = useState<number>(0); 
  const [currentArtworkTitle, setCurrentArtworkTitle] = useState<string | null>(null);


  const totalSquares = useMemo(() => config.boardSize * config.boardSize, [config.boardSize]);
  
  useEffect(() => {
    const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consentStatus === 'given' || consentStatus === 'declined') {
      setCookieConsent(consentStatus);
    }
    
    try {
      const savedScore = localStorage.getItem(TOTAL_SCORE_KEY);
      if (savedScore) {
        setTotalScore(parseInt(savedScore, 10) || 0);
      }
    } catch (error) {
      console.error("Failed to load total score from localStorage", error);
    }
  }, []);

  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    const handlePopState = () => {
      if (screenRef.current === 'game') {
        setScreen('settings');
      }
      else if (screenRef.current === 'settings') {
        window.location.href = 'https://apsardze24.lv';
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);


  const isValidPosition = useCallback((pos: Position, board: BoardState) => {
    return (
      pos.row >= 0 &&
      pos.row < config.boardSize &&
      pos.col >= 0 &&
      pos.col < config.boardSize &&
      board[pos.row][pos.col] === 0
    );
  }, [config.boardSize]);

  const getPossibleMoves = useCallback((pos: Position, board: BoardState): Position[] => {
    return KNIGHT_MOVES
      .map(move => ({ row: pos.row + move.row, col: pos.col + move.col }))
      .filter(newPos => isValidPosition(newPos, board));
  }, [isValidPosition]);

  const handleRestart = useCallback(() => {
    setBoardState(createEmptyBoard(config.boardSize));
    setGameState(GameState.NOT_STARTED);
    setCurrentPos(null);
    setMoveHistory([]);
    setPossibleMoves([]);
  }, [config.boardSize]);

  useEffect(() => {
    handleRestart();
  }, [config.boardSize, handleRestart]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameState === GameState.WON || gameState === GameState.LOST) return;

    const newPos = { row, col };

    if (gameState === GameState.NOT_STARTED) {
      const newBoard = createEmptyBoard(config.boardSize);
      newBoard[row][col] = 1;
      setBoardState(newBoard);
      setCurrentPos(newPos);
      setMoveHistory([newPos]);
      setGameState(GameState.IN_PROGRESS);
      const nextMoves = getPossibleMoves(newPos, newBoard);
      setPossibleMoves(nextMoves);
      if (nextMoves.length === 0 && totalSquares > 1) {
        setGameState(GameState.LOST);
      }
    } else if (currentPos) {
      const isPossible = possibleMoves.some(p => p.row === row && p.col === col);
      if (isPossible) {
        const newMoveNumber = moveHistory.length + 1;
        const newBoard = boardState.map(r => [...r]);
        newBoard[row][col] = newMoveNumber;
        
        const newMoveHistory = [...moveHistory, newPos];
        setBoardState(newBoard);
        setCurrentPos(newPos);
        setMoveHistory(newMoveHistory);
        
        const nextPossible = getPossibleMoves(newPos, newBoard);
        setPossibleMoves(nextPossible);

        if (newMoveNumber === totalSquares) {
          setGameState(GameState.WON);
        } else if (nextPossible.length === 0) {
          setGameState(GameState.LOST);
        }
      }
    }
  }, [gameState, config.boardSize, currentPos, possibleMoves, boardState, moveHistory, getPossibleMoves, totalSquares]);

  const handleUndo = useCallback(() => {
    if (moveHistory.length <= 1) {
        handleRestart();
        return;
    }

    const newMoveHistory = moveHistory.slice(0, -1);
    const lastPos = moveHistory[moveHistory.length - 1];
    const newCurrentPos = newMoveHistory[newMoveHistory.length - 1];

    const newBoard = boardState.map(r => [...r]);
    newBoard[lastPos.row][lastPos.col] = 0;
    
    setBoardState(newBoard);
    setCurrentPos(newCurrentPos);
    setMoveHistory(newMoveHistory);
    setPossibleMoves(getPossibleMoves(newCurrentPos, newBoard));
    setGameState(GameState.IN_PROGRESS);
  }, [moveHistory, boardState, getPossibleMoves, handleRestart]);


  useEffect(() => {
    try {
      localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save config to localStorage", error);
    }
  }, [config]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const navigateToGame = () => {
      window.history.pushState({ screen: 'game' }, '');
      setScreen('game');
  };

  const handleStartNewGame = useCallback(() => {
    if (customBackground && customBackground.startsWith('blob:')) {
      URL.revokeObjectURL(customBackground);
      setCustomBackground(null);
    }
    if (revealImage && revealImage.startsWith('blob:')) {
      URL.revokeObjectURL(revealImage);
    }
    setRevealImage(null);
    setArtworkQuiz(null);
    handleRestart();
    navigateToGame();
  }, [handleRestart, customBackground, revealImage]);

  const handleReturnToGame = useCallback(() => {
    navigateToGame();
  }, []);
  
  const handleStartWithImage = useCallback((imageUrl: string) => {
    if (customBackground && customBackground.startsWith('blob:')) {
      URL.revokeObjectURL(customBackground);
    }
    if (revealImage && revealImage.startsWith('blob:')) {
        URL.revokeObjectURL(revealImage);
    }
    setCustomBackground(imageUrl);
    setRevealImage(null);
    setArtworkQuiz(null);
    handleRestart();
    navigateToGame();
  }, [handleRestart, customBackground, revealImage]);
  
  const handleStartRevealMode = useCallback((imageUrl: string, quizData: ArtworkQuiz) => {
    if (customBackground && customBackground.startsWith('blob:')) {
      URL.revokeObjectURL(customBackground);
      setCustomBackground(null);
    }
    if (revealImage && revealImage.startsWith('blob:')) {
        URL.revokeObjectURL(revealImage);
    }
    setRevealImage(imageUrl);
    const shuffledOptions = [...quizData.options].sort(() => Math.random() - 0.5);
    setArtworkQuiz({ ...quizData, options: shuffledOptions });
    setCurrentArtworkTitle(quizData.correctTitle);
    
    setIsArtworkGuessed(false);
    setGuessBonusStartScore(0);
    setBonusPoints(0);

    handleRestart();
    navigateToGame();
  }, [handleRestart, customBackground, revealImage]);

  const handleGuessArtwork = useCallback((guess: string) => {
    if (!artworkQuiz || isArtworkGuessed) return;

    if (guess === artworkQuiz.correctTitle) {
      setIsArtworkGuessed(true);
      setGuessBonusStartScore(moveHistory.length);
    } else {
      setBonusPoints(prev => prev - 100);
    }
  }, [artworkQuiz, isArtworkGuessed, moveHistory.length]);

  const handleGoToSettings = useCallback(() => {
    window.history.back();
  }, []);
  
  const handleCookieConsent = (consent: 'given' | 'declined') => {
      localStorage.setItem(COOKIE_CONSENT_KEY, consent);
      setCookieConsent(consent);
  };
  
  const handleGameEnd = useCallback((finalScore: number) => {
    setTotalScore(prev => {
      const newTotal = prev + finalScore;
      try {
        localStorage.setItem(TOTAL_SCORE_KEY, newTotal.toString());
      } catch (error) {
        console.error("Failed to save total score to localStorage", error);
      }
      return newTotal;
    });
  }, []);

  const themeCssVariables = useMemo(() => {
    return {
      '--light-square': currentColorTheme.lightSquare,
      '--dark-square': currentColorTheme.darkSquare,
      '--visited-light': currentColorTheme.visitedLight,
      '--visited-dark': currentColorTheme.visitedDark,
      '--current-square': currentColorTheme.current,
      '--possible-square': currentColorTheme.possible,
      '--text-primary': currentColorTheme.textPrimary,
      '--text-secondary': currentColorTheme.textSecondary,
    } as React.CSSProperties;
  }, [currentColorTheme]);

  const renderContent = () => {
    if (legalScreen === 'privacy') {
      return <PrivacyPolicyScreen onBack={() => setLegalScreen(null)} />;
    }
    if (legalScreen === 'terms') {
      return <TermsOfServiceScreen onBack={() => setLegalScreen(null)} />;
    }
    if (legalScreen === 'cookies') {
      return <CookiePolicyScreen onBack={() => setLegalScreen(null)} />;
    }

    if (screen === 'settings') {
      return (
        <SettingsScreen
          config={config}
          setConfig={setConfig}
          themes={themes}
          onStartGame={handleStartNewGame}
          onReturnToGame={handleReturnToGame}
          onStartWithImage={handleStartWithImage}
          onStartRevealMode={handleStartRevealMode}
          gameState={gameState}
          totalScore={totalScore}
        />
      );
    }

    return (
       <GameScreen
          config={{...config, colorTheme: currentColorTheme}}
          onGoToSettings={handleGoToSettings}
          gameState={gameState}
          boardState={boardState}
          currentPos={currentPos}
          moveHistory={moveHistory}
          possibleMoves={possibleMoves}
          totalSquares={totalSquares}
          onSquareClick={handleSquareClick}
          onUndo={handleUndo}
          onRestart={handleRestart}
          customBackground={customBackground}
          revealImage={revealImage}
          artworkQuiz={artworkQuiz}
          isArtworkGuessed={isArtworkGuessed}
          bonusPoints={bonusPoints}
          onGuessArtwork={handleGuessArtwork}
          currentArtworkTitle={currentArtworkTitle}
          guessBonusStartScore={guessBonusStartScore}
          onGameEnd={handleGameEnd}
        />
    );
  };

  return (
      <div className="bg-gray-800 min-h-screen w-full flex flex-col items-center justify-start p-4 font-sans" style={themeCssVariables}>
        <header className="text-center mb-4 w-full max-w-2xl">
          <div className="inline-block">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wider">{t('app.title')}</h1>
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg text-gray-300">{currentColorTheme.name} {currentColorTheme.emoji}</p>
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <main className="w-full max-w-2xl flex-grow flex flex-col items-center">
          {renderContent()}
        </main>
        <Footer 
          onShowPrivacy={() => setLegalScreen('privacy')}
          onShowTerms={() => setLegalScreen('terms')}
          onShowCookies={() => setLegalScreen('cookies')}
        />
        {cookieConsent === 'pending' && (
            <CookieConsent 
                onAccept={() => handleCookieConsent('given')}
                onDecline={() => handleCookieConsent('declined')}
                onShowPolicy={() => setLegalScreen('cookies')}
            />
        )}
      </div>
  );
};

export default App;
