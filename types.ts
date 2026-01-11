export type SquareValue = number; // 0 for empty, >0 for move number
export type BoardState = SquareValue[][];

export interface Position {
  row: number;
  col: number;
}

export enum GameState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  WON = 'WON',
  LOST = 'LOST',
}

export interface ColorTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  visitedLight: string;
  visitedDark: string;
  current: string;
  possible: string;
  textPrimary: string;
  textSecondary: string;
  emoji?: string;
  emptyCellIcon?: string; // Added for themes like Tyranny
}

export interface GameResult {
  boardSize: number;
  score: number; // cells filled
  total: number; // total cells
  won: boolean;
  date: string;
}

export interface GameHistory {
  records: Record<number, number>; // boardSize -> max score
  recent: GameResult[];
}

export type LegalScreen = 'privacy' | 'terms' | 'cookies' | null;

export interface ArtworkQuiz {
  correctTitle: string;
  options: string[];
}