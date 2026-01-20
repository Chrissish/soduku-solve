import { useState, useEffect, useRef } from 'react';
import { SolveStep, PlayState } from '@/types';

export function useStepPlayer(steps: SolveStep[], speed: number = 500) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = steps.length;

  useEffect(() => {
    if (playState === 'playing') {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= totalSteps - 1) {
            setPlayState('completed');
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [playState, speed, totalSteps]);

  const play = () => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(-1); // Restart if at end
    }
    setPlayState('playing');
  };

  const pause = () => setPlayState('paused');

  const stepForward = () => {
    pause();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    pause();
    if (currentStepIndex > -1) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const jumpToStart = () => {
      pause();
      setCurrentStepIndex(-1);
  }
  
  const jumpToEnd = () => {
      pause();
      setCurrentStepIndex(totalSteps - 1);
  }
  
  const jumpToStep = (index: number) => {
      pause();
      if (index >= -1 && index < totalSteps) {
          setCurrentStepIndex(index);
      }
  }

  const currentBoard = currentStepIndex >= 0 ? steps[currentStepIndex].board : null;
  const currentMove = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  return {
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
  };
}
