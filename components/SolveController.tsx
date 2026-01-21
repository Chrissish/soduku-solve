import React from 'react';
import { PlayState } from '@/types';
import { Button } from './common/Button';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, List, FastForward } from 'lucide-react';
import { SPEED_OPTIONS } from '@/lib/constants';

interface SolveControllerProps {
  currentStep: number;
  totalSteps: number;
  playState: PlayState;
  playSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onRestart: () => void;
  onViewSteps: () => void;
  onFastForward: () => void;
}

export function SolveController({
  currentStep,
  totalSteps,
  playState,
  playSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onRestart,
  onViewSteps,
  onFastForward
}: SolveControllerProps) {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
          步骤: <span className="text-slate-900">{currentStep + 1}</span> / {totalSteps}
        </span>
        <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onFastForward} title="直接展示结果" className="whitespace-nowrap px-2">
                <FastForward size={16} className="mr-1"/> 结果
            </Button>
            <select
            className="text-sm border border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1 w-22"
            value={playSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            >
            {SPEED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                {opt.label}
                </option>
            ))}
            </select>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={onRestart} title="重头开始">
           <RotateCcw size={20} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onStepBackward} disabled={currentStep < 0}>
          <SkipBack size={20} />
        </Button>
        
        {playState === 'playing' ? (
          <Button variant="primary" size="lg" onClick={onPause} className="w-20 h-20 rounded-full shadow-lg">
            <Pause size={32} fill="currentColor" />
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={onPlay} className="w-20 h-20 rounded-full shadow-lg" disabled={totalSteps === 0 || playState === 'completed'}>
            <Play size={32} fill="currentColor" className="ml-1" />
          </Button>
        )}
        
        <Button variant="ghost" size="sm" onClick={onStepForward} disabled={currentStep >= totalSteps - 1}>
          <SkipForward size={20} />
        </Button>

        <Button variant="ghost" size="sm" onClick={onViewSteps} title="查看所有步骤">
            <List size={20} />
        </Button>
      </div>
    </div>
  );
}
