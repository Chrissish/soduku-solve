import { SolveStep, SudokuBoard, SolverStrategy } from '@/types';

export const backtrackingSolver: SolverStrategy = {
  solve(board: SudokuBoard): SolveStep[] {
    const steps: SolveStep[] = [];
    // Deep copy the board to avoid mutating the original
    const workingBoard = board.map(row => [...row]);
    
    function isValid(board: SudokuBoard, row: number, col: number, num: number): boolean {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }
      
      // Check col
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }
      
      // Check 3x3 box
      const startRow = row - (row % 3);
      const startCol = col - (col % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i + startRow][j + startCol] === num) return false;
        }
      }
      
      return true;
    }
    
    function solve(): boolean {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (workingBoard[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(workingBoard, row, col, num)) {
                workingBoard[row][col] = num;
                steps.push({
                  row,
                  col,
                  value: num,
                  board: workingBoard.map(r => [...r]),
                  reason: `在位置 (${row + 1}, ${col + 1}) 填入 ${num}`
                });
                
                if (solve()) return true;
                
                // Backtrack
                workingBoard[row][col] = 0;
                steps.push({
                  row,
                  col,
                  value: 0,
                  board: workingBoard.map(r => [...r]),
                  reason: `位置 (${row + 1}, ${col + 1}) 回溯`
                });
              }
            }
            return false;
          }
        }
      }
      return true;
    }
    
    solve();
    return steps;
  }
};
