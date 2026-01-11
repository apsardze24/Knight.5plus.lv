import React from 'react';
import { BoardState, Position, ColorTheme } from '../types';
import Square from './Square';

interface BoardProps {
  boardState: BoardState;
  onSquareClick: (row: number, col: number) => void;
  currentPos: Position | null;
  possibleMoves: Position[];
  colorTheme: ColorTheme;
  showNumbers: boolean;
  customBackground: string | null;
  revealImage: string | null;
}

const Board: React.FC<BoardProps> = ({
  boardState,
  onSquareClick,
  currentPos,
  possibleMoves,
  colorTheme,
  showNumbers,
  customBackground,
  revealImage,
}) => {
  const boardSize = boardState.length;
  const boardStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
    gridTemplateRows: `repeat(${boardSize}, 1fr)`,
    width: 'min(90vw, 80vh)',
    height: 'min(90vw, 80vh)',
    maxWidth: '600px',
    maxHeight: '600px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    backgroundImage: revealImage ? `url(${revealImage})` : (customBackground ? `url(${customBackground})` : 'none'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div style={boardStyle}>
      {boardState.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const isCurrent = currentPos?.row === rowIndex && currentPos?.col === colIndex;
          const isPossible = possibleMoves.some(
            (move) => move.row === rowIndex && move.col === colIndex
          );
          const isLight = (rowIndex + colIndex) % 2 !== 0;

          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              value={value}
              isCurrent={isCurrent}
              isPossible={isPossible}
              isVisited={value > 0}
              isLight={isLight}
              onClick={() => onSquareClick(rowIndex, colIndex)}
              colorTheme={colorTheme}
              showNumbers={showNumbers}
              hasCustomBackground={!!customBackground}
              isRevealMode={!!revealImage}
            />
          );
        })
      )}
    </div>
  );
};

export default Board;