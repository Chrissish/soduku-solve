import { SudokuBoard, SolveSettings } from '@/types';

export const EMPTY_BOARD: SudokuBoard = Array(9).fill(null).map(() => Array(9).fill(0));

export const DEFAULT_SETTINGS: SolveSettings = {
  playSpeed: 100,
  autoPlay: false,
};

export const SPEED_OPTIONS = [
  { label: '慢 (1s)', value: 1000 },
  { label: '中 (0.5s)', value: 500 },
  { label: '快 (0.1s)', value: 100 },
  { label: '极速 (0s)', value: 0 },
];
