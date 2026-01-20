import React from 'react';
import { cn } from '@/lib/utils';
import { SudokuBoard as BoardType } from '@/types';

interface SudokuBoardProps {
  board: BoardType;
  initialBoard?: BoardType; // To distinguish original numbers from filled ones
  highlightedCell?: { row: number; col: number };
  editable?: boolean;
  onCellChange?: (row: number, col: number, value: number) => void;
  className?: string;
}

export function SudokuBoard({ 
  board, 
  initialBoard,
  highlightedCell, 
  editable = false, 
  onCellChange,
  className 
}: SudokuBoardProps) {
  
  const handleInputChange = (row: number, col: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^[1-9]$/.test(val)) {
      onCellChange?.(row, col, val === '' ? 0 : parseInt(val));
    }
  };

  return (
    <div className={cn("grid grid-cols-9 gap-px bg-slate-300 border-2 border-slate-800 select-none", className)}>
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          // Check if it's a 3x3 box border
          const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
          const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
          
          const isHighlighted = highlightedCell?.row === rowIndex && highlightedCell?.col === colIndex;
          // Determine if this cell was part of the initial puzzle (if initialBoard is provided)
          // If initialBoard is not provided, we assume all non-zero cells are "initial" or just display as is.
          // But usually we pass initialBoard during solving playback.
          const isInitial = initialBoard ? initialBoard[rowIndex][colIndex] !== 0 : false;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "relative aspect-square flex items-center justify-center bg-white overflow-hidden",
                isRightBorder && "border-r-2 border-r-slate-800",
                isBottomBorder && "border-b-2 border-b-slate-800",
                isHighlighted && "bg-yellow-100"
              )}
            >
              {editable ? (
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={cell === 0 ? '' : cell}
                  onChange={(e) => handleInputChange(rowIndex, colIndex, e)}
                  className={cn(
                    "w-full h-full text-center text-lg sm:text-xl md:text-2xl font-medium bg-transparent outline-none focus:bg-blue-50 p-0 m-0",
                    cell !== 0 ? "text-slate-900" : "text-slate-400"
                  )}
                />
              ) : (
                <span className={cn(
                  "text-lg sm:text-xl md:text-2xl flex items-center justify-center w-full h-full",
                  cell !== 0 && "font-medium",
                  isInitial ? "text-slate-900" : "text-blue-600",
                  // If it's the highlighted cell (recently filled), make it stand out
                  isHighlighted && !isInitial && "text-emerald-600 font-bold scale-110 transition-transform duration-200"
                )}>
                  {cell !== 0 ? cell : ''}
                </span>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
}
