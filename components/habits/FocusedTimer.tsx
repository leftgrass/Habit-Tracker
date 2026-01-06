'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Clock, Target, Trophy } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { useConfetti } from '@/hooks/useConfetti';
import { useHabitStore } from '@/store/useHabitStore';
import { format } from 'date-fns';

interface FocusedTimerProps {
  habitId: string;
  date: string;
  onClose: () => void;
}

function formatElapsedTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.floor((totalMinutes * 60) % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function FocusedTimer({ habitId, date, onClose }: FocusedTimerProps) {
  const { habits, setFocusedTimer, toggleHabitCompletion } = useHabitStore();
  const habit = habits.find(h => h.id === habitId);
  const { triggerConfetti } = useConfetti();

  const [elapsedDisplay, setElapsedDisplay] = useState(0);

  const handleTick = useCallback((mins: number) => {
    setElapsedDisplay(mins * 60);
  }, []);

  const { isRunning, start, pause, toggle } = useTimer({
    habitId,
    date,
    onTick: (mins) => {
      handleTick(mins);
      toggleHabitCompletion(habitId, date, mins);
    },
  });

  const currentMinutes = habit?.completions[date] || 0;
  const targetMinutes = habit?.targetMinutes || 30;
  const isCompleted = currentMinutes >= targetMinutes;
  const progress = Math.min((currentMinutes / targetMinutes) * 100, 100);

  useEffect(() => {
    setElapsedDisplay(currentMinutes * 60);
  }, [currentMinutes]);

  useEffect(() => {
    if (currentMinutes >= targetMinutes && !isRunning) {
      triggerConfetti(habitId, date);
    }
  }, [isCompleted, currentMinutes, targetMinutes, isRunning, habitId, date, triggerConfetti]);

  const handleClose = () => {
    if (isRunning) {
      pause();
    }
    setFocusedTimer(null, null);
    onClose();
  };

  const handleReset = () => {
    toggleHabitCompletion(habitId, date, 0);
    setElapsedDisplay(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            'relative w-full max-w-lg mx-4 rounded-3xl shadow-2xl overflow-hidden',
            'bg-[var(--card-bg)] border-2',
            isCompleted ? 'border-[var(--success)]' : 'border-[var(--card-border)]'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[var(--success)]/10"
            />
          )}

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pt-8 px-8 text-center relative z-10">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-sm font-medium text-[var(--muted)]">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>

            <div
              className="w-4 h-4 rounded-full mx-auto mb-4"
              style={{ backgroundColor: habit?.color || '#6366F1' }}
            />
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {habit?.name || 'Habit'}
            </h2>
          </div>

          <div className="px-8 py-8 relative z-10">
            <motion.div
              className={cn(
                'text-7xl font-mono font-bold text-center tabular-nums tracking-tight',
                isCompleted ? 'text-[var(--success)]' : 'text-[var(--foreground)]'
              )}
              animate={{ scale: isCompleted ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: isCompleted ? Infinity : 0, duration: 2 }}
            >
              {formatElapsedTime(isRunning ? Math.floor(elapsedDisplay / 60) : currentMinutes)}
            </motion.div>

            <div className="flex items-center justify-center space-x-2 mt-4 text-[var(--muted)]">
              <Target className="w-4 h-4" />
              <span className="text-sm">
                Target: {formatTime(targetMinutes)}
              </span>
              {isCompleted && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 text-[var(--success)]"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">Goal Met!</span>
                </motion.span>
              )}
            </div>

            <div className="mt-6">
              <div className="h-4 bg-[var(--card-border)] rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full transition-colors',
                    isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
                <span>0m</span>
                <span>{formatTime(targetMinutes)}</span>
                <span>12h</span>
              </div>
            </div>
          </div>

            <div className="px-8 pb-8 flex items-center justify-center space-x-4 relative z-10">
            <button
              onClick={handleReset}
              className="p-4 rounded-full bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all timer-button"
              title="Reset"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={toggle}
              className={cn(
                'p-6 rounded-full transition-all shadow-lg timer-button',
                isRunning
                  ? 'bg-[var(--warning)] text-white hover:bg-[var(--warning)]/80'
                  : 'bg-[var(--success)] text-white hover:bg-[var(--success)]/80'
              )}
              title={isRunning ? 'Pause' : 'Start'}
            >
              {isRunning ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="px-8 py-4 bg-[var(--secondary)] border-t border-[var(--card-border)] relative z-10">
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <div className="text-[var(--muted)]">Progress</div>
                <div className="font-bold text-[var(--foreground)]">{Math.round(progress)}%</div>
              </div>
              <div className="text-center">
                <div className="text-[var(--muted)]">Remaining</div>
                <div className="font-bold text-[var(--foreground)]">
                  {formatTime(Math.max(0, targetMinutes - currentMinutes))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[var(--muted)]">Session</div>
                <div className="font-bold text-[var(--foreground)]">
                  {formatTime(currentMinutes)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
