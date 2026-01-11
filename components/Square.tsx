import React from 'react';
import { ColorTheme } from '../types';

interface SquareProps {
  value: number;
  isCurrent: boolean;
  isPossible: boolean;
  isVisited: boolean;
  isLight: boolean;
  onClick: () => void;
  colorTheme: ColorTheme;
  showNumbers: boolean;
  hasCustomBackground: boolean;
  isRevealMode: boolean;
}

const Square: React.FC<SquareProps> = ({
  value,
  isCurrent,
  isPossible,
  isVisited,
  isLight,
  onClick,
  colorTheme,
  showNumbers,
  hasCustomBackground,
  isRevealMode,
}) => {
  const isRevealModeActive = isRevealMode && !hasCustomBackground;

  const getBackgroundColor = () => {
    if (isRevealModeActive) {
      return (isVisited || isCurrent) ? 'transparent' : '#000000';
    }
    if (isCurrent) return colorTheme.current;
    if (hasCustomBackground) return 'transparent';
    if (isVisited) {
      return isLight ? colorTheme.visitedLight : colorTheme.visitedDark;
    }
    return isLight ? colorTheme.lightSquare : colorTheme.darkSquare;
  };

  const squareStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.5em',
    fontWeight: 'bold',
    border: isRevealModeActive ? '1px solid #555' : (hasCustomBackground ? '1px solid rgba(255, 255, 255, 0.4)' : 'none'),
    boxSizing: 'border-box',
    position: 'relative',
    cursor: 'pointer',
    backgroundColor: getBackgroundColor(),
    color: (isRevealModeActive && (isVisited || isCurrent)) 
      ? '#FFFFFF' 
      : (isVisited ? colorTheme.textPrimary : colorTheme.textSecondary),
    transition: 'background-color 0.2s ease',
    overflow: 'hidden', // Prevents content from spilling out
  };
  
  const possibleMoveIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    height: '30%',
    borderRadius: '50%',
    backgroundColor: colorTheme.possible,
    pointerEvents: 'none',
  };

  const textShadowForReveal = '0 1px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)';

  const emojiStyle: React.CSSProperties = {
      fontSize: 'clamp(1.5rem, 6vmin, 2.8rem)',
      lineHeight: 1,
      color: colorTheme.textPrimary,
      filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))',
      textShadow: isRevealModeActive ? textShadowForReveal : undefined,
  };
  
  const emptyCellIconStyle: React.CSSProperties = {
      ...emojiStyle,
      opacity: 0.25,
  };

  const numberStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: '2px',
      right: '4px',
      fontSize: 'clamp(0.6rem, 2.5vmin, 1rem)',
      color: colorTheme.textSecondary,
      fontWeight: 'bold',
      textShadow: isRevealModeActive ? textShadowForReveal : '0 0 4px rgba(0, 0, 0, 0.7)',
  };

  const classicNumberStyle: React.CSSProperties = {
      color: colorTheme.textPrimary, 
      fontSize: 'clamp(0.72rem, 2.7vmin, 1.2rem)',
      fontWeight: 'bold',
      textShadow: isRevealModeActive ? textShadowForReveal : '0 1px 2px rgba(0, 0, 0, 0.3)',
  };

  const showContent = !isRevealModeActive || isVisited || isCurrent;

  return (
    <button style={squareStyle} onClick={onClick}>
       {showContent && (
        <>
          {/* Hide empty icon in reveal mode */}
          {value === 0 && colorTheme.emptyCellIcon && !isRevealModeActive && (
            <span style={emptyCellIconStyle}>{colorTheme.emptyCellIcon}</span>
          )}

          {isRevealModeActive ? (
            // In reveal mode, only show the number if enabled
            value > 0 && showNumbers ? <span style={classicNumberStyle}>{value}</span> : null
          ) : (
            // Original logic for normal modes
            value > 0 && colorTheme.emoji ? (
              <>
                <span style={emojiStyle}>{colorTheme.emoji}</span>
                {showNumbers && <span style={numberStyle}>{value}</span>}
              </>
            ) : value > 0 && showNumbers ? (
              <span style={classicNumberStyle}>{value}</span>
            ) : null
          )}
        </>
      )}
      {isPossible && <div style={possibleMoveIndicatorStyle}></div>}
    </button>
  );
};

export default Square;