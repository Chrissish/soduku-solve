import { useState, useCallback } from 'react';
import { SudokuBoard, SolveStep, AlgorithmType } from '@/types';
import { solveSudoku } from '@/lib/sudokuSolver';

export function useSudokuSolver() {
  const [isSolving, setIsSolving] = useState(false);
  const [steps, setSteps] = useState<SolveStep[]>([]);
  const [solvedBoard, setSolvedBoard] = useState<SudokuBoard | null>(null);

  const solve = useCallback((board: SudokuBoard, algo: AlgorithmType = 'backtracking') => {
    setIsSolving(true);
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        const start = performance.now();
        const resultSteps = solveSudoku(board, algo);
        const end = performance.now();
        console.log(`Solved with ${algo} in ${end - start}ms, ${resultSteps.length} steps`);
        
        setSteps(resultSteps);
        if (resultSteps.length > 0) {
          setSolvedBoard(resultSteps[resultSteps.length - 1].board);
        } else {
             // Handle no solution case if needed
        }
      } catch (e) {
        console.error("Solving failed", e);
      } finally {
        setIsSolving(false);
      }
    }, 100);
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setSolvedBoard(null);
    setIsSolving(false);
  }, []);

  return {
    isSolving,
    steps,
    solvedBoard,
    solve,
    reset
  };
}
