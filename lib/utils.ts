import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function boardToString(board: number[][]): string {
  return board.flat().join('');
}

export function stringToBoard(str: string): number[][] {
  const nums = str.split('').map(c => parseInt(c) || 0);
  const board: number[][] = [];
  for (let i = 0; i < 9; i++) {
    board.push(nums.slice(i * 9, (i + 1) * 9));
  }
  return board;
}
