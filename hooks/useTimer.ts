'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useHabitStore } from '@/store/useHabitStore';

interface UseTimerOptions {
  habitId: string;
  date: string;
  onTick?: (elapsedMinutes: number) => void;
}

export function useTimer({ habitId, date, onTick }: UseTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { activeTimer, startTimer, pauseTimer, getElapsedMinutes, getElapsedSeconds } = useHabitStore();

  const isTimerActive = activeTimer?.habitId === habitId &&
                        activeTimer?.date === date &&
                        activeTimer?.isRunning;

  const start = useCallback(() => {
    startTimer(habitId, date);
  }, [habitId, date, startTimer]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pauseTimer();
    setIsRunning(false);
  }, [pauseTimer]);

  const reset = useCallback(() => {
    setElapsed(0);
  }, []);

  const toggle = useCallback(() => {
    if (isTimerActive) {
      pause();
    } else {
      start();
    }
  }, [isTimerActive, start, pause]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTimerActive) {
        const currentElapsed = getElapsedMinutes();
        onTick?.(currentElapsed);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerActive, getElapsedMinutes, onTick]);

  useEffect(() => {
    if (isTimerActive && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const currentElapsed = getElapsedSeconds();
        setElapsed(currentElapsed);
        const currentMinutes = Math.floor(currentElapsed / 60);
        onTick?.(currentMinutes);
      }, 1000);
      setIsRunning(true);
    } else if (!isTimerActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [isTimerActive, getElapsedSeconds, onTick]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning: isTimerActive,
    elapsed,
    start,
    pause,
    toggle,
    reset,
    setElapsed,
  };
}
