import { SudokuBoard } from '@/types';

export function isValidSudoku(board: SudokuBoard): boolean {
  // Check rows
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set<number>();
    for (let j = 0; j < 9; j++) {
      const val = board[i][j];
      if (val !== 0) {
        if (rowSet.has(val)) return false;
        rowSet.add(val);
      }
    }
  }

  // Check cols
  for (let j = 0; j < 9; j++) {
    const colSet = new Set<number>();
    for (let i = 0; i < 9; i++) {
      const val = board[i][j];
      if (val !== 0) {
        if (colSet.has(val)) return false;
        colSet.add(val);
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxSet = new Set<number>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = board[boxRow * 3 + i][boxCol * 3 + j];
          if (val !== 0) {
            if (boxSet.has(val)) return false;
            boxSet.add(val);
          }
        }
      }
    }
  }

  return true;
}

export function isFull(board: SudokuBoard): boolean {
  return board.every(row => row.every(cell => cell !== 0));
}
