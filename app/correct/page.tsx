'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SudokuBoard } from '@/components/SudokuBoard';
import { Button } from '@/components/common/Button';
import { stringToBoard, boardToString } from '@/lib/utils';
import { SudokuBoard as BoardType } from '@/types';
import { ArrowRight, RotateCcw, Home } from 'lucide-react';
import { isValidSudoku } from '@/lib/sudokuValidator';

function CorrectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [board, setBoard] = useState<BoardType>(Array(9).fill(null).map(() => Array(9).fill(0)));

  useEffect(() => {
    const boardStr = searchParams.get('board');
    if (boardStr) {
      // Use setTimeout to avoid synchronous state update warning
      setTimeout(() => setBoard(stringToBoard(boardStr)), 0);
    }
  }, [searchParams]);

  const handleCellChange = (row: number, col: number, value: number) => {
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);
  };

  const handleConfirm = () => {
    if (!isValidSudoku(board)) {
      if (!confirm('当前数独可能存在冲突，确定要继续吗？')) {
        return;
      }
    }
    const boardStr = boardToString(board);
    router.push(`/solve?board=${boardStr}`);
  };

  const handleReset = () => {
    if (confirm('确定要重置为初始识别结果吗？')) {
        const boardStr = searchParams.get('board');
        if (boardStr) {
        setBoard(stringToBoard(boardStr));
        } else {
        setBoard(Array(9).fill(null).map(() => Array(9).fill(0)));
        }
    }
  };
  
  const handleClear = () => {
      if (confirm('确定要清空所有格子吗？')) {
          setBoard(Array(9).fill(null).map(() => Array(9).fill(0)));
      }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
      <div className="text-center w-full relative pt-1">
        <Button variant="ghost" size="sm" className="absolute left-0 top-1" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" /> 首页
        </Button>
        <h1 className="text-xl font-bold text-slate-900">确认题目</h1>
        <p className="text-sm text-slate-600">请校对识别结果，点击格子可修改</p>
      </div>

      <SudokuBoard 
        board={board} 
        editable 
        onCellChange={handleCellChange}
        className="w-full shadow-lg rounded-lg overflow-hidden"
      />

      <div className="flex gap-4 w-full">
        <Button variant="ghost" onClick={handleClear} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            清空
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> 重置
        </Button>
        <Button className="flex-1" onClick={handleConfirm}>
          开始 <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CorrectPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-6 sm:justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <CorrectionContent />
      </Suspense>
    </main>
  );
}
