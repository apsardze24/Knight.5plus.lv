import React, { useRef, useState, useEffect } from 'react';
import { BoardState, Position, GameState, ColorTheme, GameResult, ArtworkQuiz } from '../types';
import Board from '../components/Board';
import { useTranslation } from '../context/LanguageContext';

// This interface should match AppConfig in App.tsx
interface GameConfig {
  boardSize: number;
  colorTheme: ColorTheme;
  showHints: boolean;
  showNumbers: boolean;
}

interface GameScreenProps {
  config: GameConfig;
  onGoToSettings: () => void;
  gameState: GameState;
  boardState: BoardState;
  currentPos: Position | null;
  moveHistory: Position[];
  possibleMoves: Position[];
  totalSquares: number;
  onSquareClick: (row: number, col: number) => void;
  onUndo: () => void;
  onRestart: () => void;
  customBackground: string | null;
  revealImage: string | null;
  artworkQuiz: ArtworkQuiz | null;
  isArtworkGuessed: boolean;
  bonusPoints: number;
  onGuessArtwork: (guess: string) => void;
  currentArtworkTitle: string | null;
  guessBonusStartScore: number;
  onGameEnd: (score: number) => void;
}

declare const html2canvas: any;

const GameScreen: React.FC<GameScreenProps> = ({ 
  config, 
  onGoToSettings,
  gameState,
  boardState,
  currentPos,
  moveHistory,
  possibleMoves,
  totalSquares,
  onSquareClick,
  onUndo,
  onRestart,
  customBackground,
  revealImage,
  artworkQuiz,
  isArtworkGuessed,
  bonusPoints,
  onGuessArtwork,
  currentArtworkTitle,
  guessBonusStartScore,
  onGameEnd,
}) => {
  const { boardSize, colorTheme, showHints, showNumbers } = config;
  const { t, language } = useTranslation();
  const boardRef = useRef<HTMLDivElement>(null);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [guessFeedback, setGuessFeedback] = useState<{ message: string; type: 'correct' | 'incorrect' } | null>(null);
  const gameEndedRef = useRef(false);

  const score = moveHistory.length;
  const gameIsOver = gameState === GameState.WON || gameState === GameState.LOST;
  const gameResult: GameResult | null = gameIsOver ? {
    boardSize: boardSize,
    score: score,
    total: totalSquares,
    won: gameState === GameState.WON,
    date: new Date().toISOString()
  } : null;
  
  const isLongLanguage = language === 'ru' || language === 'de';
  const buttonTextSize = isLongLanguage ? 'text-base' : 'text-lg';

  const bonusFromGuess = isArtworkGuessed ? Math.max(0, score - guessBonusStartScore) : 0;
  const totalScore = score + bonusPoints + bonusFromGuess;
  
  useEffect(() => {
    // Reset quiz UI state when a new game starts
    if (score <= 1) {
        setDisabledOptions([]);
        setGuessFeedback(null);
        gameEndedRef.current = false;
    }
  }, [score]);

  useEffect(() => {
    if (gameIsOver && !gameEndedRef.current) {
      onGameEnd(totalScore);
      gameEndedRef.current = true;
    }
  }, [gameIsOver, onGameEnd, totalScore]);


  const handleGuess = (guess: string) => {
    if (disabledOptions.includes(guess)) return;

    const isCorrect = artworkQuiz?.correctTitle === guess;
    onGuessArtwork(guess);

    if (isCorrect) {
      setGuessFeedback({ message: t('game.correctGuess'), type: 'correct' });
    } else {
      setDisabledOptions(prev => [...prev, guess]);
      setGuessFeedback({ message: t('game.incorrectGuess'), type: 'incorrect' });
      setTimeout(() => setGuessFeedback(null), 3000);
    }
  };

  const handleShareResult = async () => {
    if (!navigator.share || !boardRef.current) {
      alert('Sharing is not supported on this device.');
      return;
    }
  
    try {
      const canvas = await html2canvas(boardRef.current, {
        backgroundColor: null, // Preserve transparency
        useCORS: true, // For custom background images
      });
  
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas.');
          return;
        }
  
        const file = new File([blob], 'knights-tour-result.png', { type: 'image/png' });
        const shareText = t('gameOver.shareText')
          .replace('{score}', totalScore.toString())
          .replace('{total}', totalSquares.toString());
  
        const shareData = {
          text: shareText,
          title: t('app.title'),
          files: [file],
        };
  
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share(shareData);
        } else {
          // Fallback to sharing text and URL if files are not supported
          await navigator.share({
            title: t('app.title'),
            text: shareText,
            url: 'http://knight.5plus.lv'
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error sharing result:', error);
      alert('Could not share result. Please try again.');
    }
  };


  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex justify-between items-center w-full max-w-lg mb-4 px-2" style={{ maxWidth: '600px' }}>
        <div className="text-white text-lg">
          {t('game.score')}: <span className="font-bold">{totalScore}</span>
        </div>
        <div className="flex space-x-2">
            <button onClick={onUndo} disabled={moveHistory.length < 2 || gameIsOver} className="px-2 py-2 text-sm whitespace-nowrap bg-yellow-500 text-white rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">{t('game.undo')}</button>
            <button onClick={onRestart} className="px-2 py-2 text-sm whitespace-nowrap bg-red-500 text-white rounded-md transition-colors">{t('game.restart')}</button>
            <button onClick={onGoToSettings} className="px-2 py-2 text-sm whitespace-nowrap bg-blue-500 text-white rounded-md transition-colors">{t('game.settings')}</button>
        </div>
      </div>
      
      <div ref={boardRef}>
        <Board
          boardState={boardState}
          onSquareClick={onSquareClick}
          currentPos={currentPos}
          possibleMoves={showHints ? possibleMoves : []}
          colorTheme={colorTheme}
          showNumbers={showNumbers}
          customBackground={customBackground}
          revealImage={revealImage}
        />
      </div>

      {revealImage && artworkQuiz && !isArtworkGuessed && (
        <div className="mt-4 w-full p-4 bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-lg text-white text-center animate-fade-in" style={{ maxWidth: '600px' }}>
            <h3 className="text-lg font-bold mb-3">{t('game.guessTheArtwork')}</h3>
            <div className="grid grid-cols-2 gap-2">
                {artworkQuiz.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleGuess(option)}
                        disabled={disabledOptions.includes(option)}
                        className="p-2 rounded-md text-sm font-semibold text-white bg-gray-700 hover:bg-gray-600 disabled:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {option}
                    </button>
                ))}
            </div>
            {guessFeedback && guessFeedback.type === 'incorrect' && (
                <p className="mt-2 text-sm text-red-400">{guessFeedback.message}</p>
            )}
        </div>
      )}
      {isArtworkGuessed && guessFeedback && guessFeedback.type === 'correct' && (
        <div className="mt-4 w-full p-3 bg-green-800/60 rounded-xl text-center animate-fade-in" style={{ maxWidth: '600px' }}>
            <p className="font-bold text-green-300">{guessFeedback.message}</p>
        </div>
      )}


      {gameIsOver && gameResult && (
        <div className="mt-4 w-full p-4 bg-gray-700/50 backdrop-blur-sm rounded-xl shadow-lg text-white text-center animate-fade-in" style={{ maxWidth: '600px' }}>
          <h2 className="text-2xl font-bold mb-2">
            {gameResult.won ? `🎉 ${t('gameOver.winTitle')} 🎉` : t('gameOver.loseTitle')}
          </h2>
          <p className="text-md mb-3 text-gray-300">
            {gameResult.won ? t('gameOver.winMessage') : t('gameOver.loseMessage')}
          </p>
          <div className="text-center bg-gray-700 p-3 rounded-md mb-4">
              {currentArtworkTitle && <p className="text-md text-gray-400 mb-2">{t('gameOver.artworkTitle')}: <span className="font-semibold text-gray-200">{currentArtworkTitle}</span></p>}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs uppercase text-gray-400">{t('gameOver.baseScore')}</p>
                  <p className="text-2xl font-bold text-white">{gameResult.score}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">{bonusPoints < 0 ? t('gameOver.penalty') : t('gameOver.bonusPoints')}</p>
                  <p className={`text-2xl font-bold ${bonusPoints + bonusFromGuess >= 0 ? 'text-green-400' : 'text-red-400'}`}>{bonusPoints + bonusFromGuess}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">{t('gameOver.totalScore')}</p>
                  <p className="text-2xl font-bold text-yellow-400">{totalScore}</p>
                </div>
              </div>
          </div>
          <div className="flex flex-col space-y-3">
             <div className="flex space-x-3">
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
             {/* Fix: Corrected typo from `buttonText-size` to `buttonTextSize` to ensure the dynamic class is applied correctly. */}
             <button
                onClick={handleShareResult}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg ${buttonTextSize} transition-transform duration-200 transform hover:scale-105 flex items-center justify-center space-x-2`}
             >
                <span>{t('gameOver.shareResult')}</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;