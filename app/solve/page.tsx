'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SudokuBoard } from '@/components/SudokuBoard';
import { SolveController } from '@/components/SolveController';
import { Button } from '@/components/common/Button';
import { useSudokuSolver } from '@/hooks/useSudokuSolver';
import { useStepPlayer } from '@/hooks/useStepPlayer';
import { stringToBoard } from '@/lib/utils';
import { SudokuBoard as BoardType } from '@/types';
import { Home, Loader2 } from 'lucide-react';
import { DEFAULT_SETTINGS } from '@/lib/constants';

function SolveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialBoard, setInitialBoard] = useState<BoardType>(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [speed, setSpeed] = useState(DEFAULT_SETTINGS.playSpeed);
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  const { isSolving, steps, solve } = useSudokuSolver();
  
  const {
    currentStepIndex,
    playState,
    currentBoard,
    currentMove,
    play,
    pause,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    jumpToStep,
    setPlayState
  } = useStepPlayer(steps, speed);

  useEffect(() => {
    const boardStr = searchParams.get('board');
    if (boardStr) {
      const board = stringToBoard(boardStr);
      // Use setTimeout to avoid synchronous state update warning
      setTimeout(() => {
        setInitialBoard(board);
        solve(board);
      }, 0);
    }
  }, [searchParams, solve]);

  const displayBoard = currentBoard || initialBoard;
  const highlightedCell = currentMove ? { row: currentMove.row, col: currentMove.col } : undefined;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg pb-4">
      <div className="text-center w-full relative pt-1">
         <Button variant="ghost" size="sm" className="absolute left-0 top-1" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" /> 首页
         </Button>
        <h1 className="text-xl font-bold text-slate-900">解题演示</h1>
        <p className="text-sm text-slate-600">
           {isSolving ? '正在计算解题步骤...' : `共 ${steps.length} 步`}
        </p>
      </div>

      <SudokuBoard 
        board={displayBoard} 
        initialBoard={initialBoard}
        highlightedCell={highlightedCell}
        className="w-full shadow-lg rounded-lg overflow-hidden"
      />
      
      {isSolving ? (
          <div className="flex items-center justify-center h-32 w-full bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="flex flex-col items-center gap-2">
                 <Loader2 className="animate-spin text-blue-600" size={32} />
                 <span className="text-slate-500">正在求解...</span>
             </div>
          </div>
      ) : (
          <SolveController 
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            playState={playState}
            playSpeed={speed}
            onPlay={play}
            onPause={pause}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onSpeedChange={setSpeed}
            onRestart={() => {
                jumpToStart();
                setPlayState('idle');
            }}
            onViewSteps={() => setShowAllSteps(!showAllSteps)}
            onFastForward={() => {
                jumpToEnd();
                setPlayState('completed');
            }}
          />
      )}
      
      {showAllSteps && steps.length > 0 && (
        <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-slate-100 font-semibold text-slate-700 sticky top-0 bg-white">
            所有步骤
          </div>
          <div className="divide-y divide-slate-50">
            {steps.map((step, index) => (
              <button
                key={index}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors flex justify-between items-center ${
                  currentStepIndex === index ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600'
                }`}
                onClick={() => {
                  jumpToStep(index);
                  // Optional: keep list open or close it? Let's keep it open.
                }}
              >
                <span>Step {index + 1}: ({step.row + 1}, {step.col + 1}) = {step.value}</span>
                <span className="text-xs text-slate-400">{step.reason || 'Fill'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentMove?.reason && !showAllSteps && (
          <div className="w-full bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 text-sm text-center">
              {currentMove.reason}
          </div>
      )}
    </div>
  );
}

export default function SolvePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-6 sm:justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SolveContent />
      </Suspense>
    </main>
  );
}
