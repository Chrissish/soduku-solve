import { SolveStep, SudokuBoard, AlgorithmType, SolverStrategy } from '@/types';
import { backtrackingSolver } from './solvers/backtrackingSolver';
import { mrvSolver } from './solvers/mrvSolver';
import { dlxSolver } from './solvers/dlxSolver';

export function solveSudoku(board: SudokuBoard, algorithm: AlgorithmType = 'backtracking'): SolveStep[] {
  let strategy: SolverStrategy;

  switch (algorithm) {
    case 'mrv':
      strategy = mrvSolver;
      break;
    case 'dlx':
      strategy = dlxSolver;
      break;
    case 'backtracking':
    default:
      strategy = backtrackingSolver;
      break;
  }

  return strategy.solve(board);
}
