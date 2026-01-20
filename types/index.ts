export type SudokuBoard = number[][];

export type SolveStep = {
  row: number;
  col: number;
  value: number;
  board: SudokuBoard;
  reason?: string;
};

export type OCRResult = {
  board: SudokuBoard;
  confidence: number[][];
};

export type PlayState = 'idle' | 'playing' | 'paused' | 'completed';

export type SolveSettings = {
  playSpeed: number;
  autoPlay: boolean;
};
