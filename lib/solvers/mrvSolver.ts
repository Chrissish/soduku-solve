import { SolveStep, SudokuBoard, SolverStrategy } from '@/types';

export const mrvSolver: SolverStrategy = {
  solve(board: SudokuBoard): SolveStep[] {
    const steps: SolveStep[] = [];
    const workingBoard = board.map(row => [...row]);
    
    // Helper to get available candidates for a cell using bitmask
    function getCandidates(board: number[][], row: number, col: number): number {
      let bits = 0x1FF; // 0b111111111 (1-9 all available)
      
      // Check row and col
      for (let i = 0; i < 9; i++) {
        if (board[row][i] !== 0) bits &= ~(1 << (board[row][i] - 1));
        if (board[i][col] !== 0) bits &= ~(1 << (board[i][col] - 1));
      }
      
      // Check box
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = board[startRow + i][startCol + j];
          if (val !== 0) bits &= ~(1 << (val - 1));
        }
      }
      return bits;
    }

    // MRV heuristic: find the cell with minimum remaining values
    function selectNextCell(board: number[][]): { row: number, col: number, candidates: number } | null {
      let minCandidates = 10;
      let bestCell = null;
      let bestBits = 0;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            const bits = getCandidates(board, r, c);
            // Count set bits
            let count = 0;
            let temp = bits;
            while (temp) { temp &= (temp - 1); count++; }

            if (count === 0) return { row: r, col: c, candidates: 0 }; // Dead end
            
            if (count < minCandidates) {
              minCandidates = count;
              bestCell = { row: r, col: c };
              bestBits = bits;
              if (count === 1) return { row: r, col: c, candidates: bits }; // Optimal
            }
          }
        }
      }
      
      return bestCell ? { ...bestCell, candidates: bestBits } : null;
    }

    function solve(): boolean {
      const next = selectNextCell(workingBoard);
      
      // If no empty cells, puzzle solved
      if (!next) return true;
      
      // If dead end (no candidates for an empty cell), backtrack
      if (next.candidates === 0) return false;
      
      const { row, col, candidates } = next;
      
      // Try each candidate
      for (let num = 1; num <= 9; num++) {
        if ((candidates & (1 << (num - 1))) !== 0) {
          workingBoard[row][col] = num;
          steps.push({
            row,
            col,
            value: num,
            board: workingBoard.map(r => [...r]),
            reason: `MRV: 在位置 (${row + 1}, ${col + 1}) 填入 ${num} (可选值最少)`
          });
          
          if (solve()) return true;
          
          // Backtrack
          workingBoard[row][col] = 0;
          steps.push({
            row,
            col,
            value: 0,
            board: workingBoard.map(r => [...r]),
            reason: `MRV: 位置 (${row + 1}, ${col + 1}) 回溯`
          });
        }
      }
      
      return false;
    }

    solve();
    return steps;
  }
};
