'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Minimize2, Maximize2, GripHorizontal } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { useHabitStore } from '@/store/useHabitStore';

interface FloatingTimerProps {
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

export function FloatingTimer({ habitId, date, onClose }: FloatingTimerProps) {
  const { habits, toggleHabitCompletion, setFloatingTimerPosition } = useHabitStore();
  const habit = habits.find(h => h.id === habitId);

  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  const [elapsedDisplay, setElapsedDisplay] = useState(0);
  const isRunningRef = useRef(false);

  const { isRunning, toggle } = useTimer({
    habitId,
    date,
    onTick: (mins) => {
      toggleHabitCompletion(habitId, date, mins);
    },
  });

  isRunningRef.current = isRunning;

  useEffect(() => {
    if (isRunning) {
      setElapsedDisplay(useHabitStore.getState().getElapsedSeconds());
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      setElapsedDisplay(useHabitStore.getState().getElapsedSeconds());
      const interval = setInterval(() => {
        if (!isRunningRef.current) return;
        setElapsedDisplay(useHabitStore.getState().getElapsedSeconds());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const currentMinutes = habit?.completions[date] || 0;
  const targetMinutes = habit?.targetMinutes || 30;
  const isCompleted = currentMinutes >= targetMinutes;
  const progress = Math.min((currentMinutes / targetMinutes) * 100, 100);

  const displaySeconds = isRunning ? elapsedDisplay : currentMinutes * 60;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setPosition(p => ({ ...p }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Mouse down on drag handle - start dragging
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Mouse move - update position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep within viewport bounds with some padding
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - 200;

        const boundedX = Math.max(10, Math.min(newX, maxX));
        const boundedY = Math.max(10, Math.min(newY, maxY));

        setPosition({ x: boundedX, y: boundedY });
        setFloatingTimerPosition({ x: boundedX, y: boundedY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, setFloatingTimerPosition]);

  // Load saved position on mount
  useEffect(() => {
    const savedPosition = useHabitStore.getState().uiState.floatingTimerPosition;
    if (savedPosition) {
      setPosition(savedPosition);
    }
  }, []);

  const handleClose = () => {
    if (isRunning) {
      toggle();
    }
    onClose();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (isExpanded) {
    return (
      <AnimatePresence>
        <motion.div
          ref={dragRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            x: position.x,
            y: position.y,
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed z-[9999] w-80 bg-[var(--card-bg)] rounded-2xl shadow-2xl border-2 overflow-hidden"
          style={{
            left: 0,
            top: 0,
            transform: 'translate(0, 0)',
          }}
        >
          {/* Header with drag handle */}
          <div
            className="flex items-center justify-between px-3 py-2 bg-[var(--secondary)] border-b border-[var(--card-border)] cursor-move"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center space-x-2">
              <GripHorizontal className="w-4 h-4 text-[var(--muted)]" />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: habit?.color || '#6366F1' }}
              />
              <span className="text-sm font-medium text-[var(--foreground)] truncate max-w-[120px]">
                {habit?.name || 'Timer'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleExpand}
                className="p-1 rounded hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded content */}
          <div className="p-4">
            <motion.div
              className={cn(
                'text-4xl font-mono font-bold text-center tabular-nums tracking-tight mb-3',
                isCompleted ? 'text-[var(--success)]' : 'text-[var(--foreground)]'
              )}
              animate={{ scale: isCompleted ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: isCompleted ? Infinity : 0, duration: 2 }}
            >
              {formatElapsedTime(isRunning ? Math.floor(displaySeconds / 60) : currentMinutes)}
            </motion.div>

            <div className="flex items-center justify-center space-x-2 mb-3 text-xs text-[var(--muted)]">
              <span>Target: {formatTime(targetMinutes)}</span>
              {isCompleted && (
                <span className="text-[var(--success)] font-medium">Goal Met!</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-[var(--card-border)] rounded-full overflow-hidden mb-3">
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

            {/* Controls */}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={toggle}
                className={cn(
                  'p-3 rounded-full transition-all shadow-lg',
                  isRunning
                    ? 'bg-[var(--warning)] text-white hover:bg-[var(--warning)]/80'
                    : 'bg-[var(--success)] text-white hover:bg-[var(--success)]/80'
                )}
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-between mt-3 pt-3 border-t border-[var(--card-border)] text-xs">
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
      </AnimatePresence>
    );
  }

  // Compact mode
  return (
    <AnimatePresence>
      <motion.div
        ref={dragRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          x: position.x,
          y: position.y,
        }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed z-[9999] bg-[var(--card-bg)] rounded-xl shadow-xl border-2 overflow-hidden"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(0, 0)',
          minWidth: '180px',
        }}
      >
        {/* Header with drag handle */}
        <div
          className="flex items-center justify-between px-3 py-1.5 bg-[var(--secondary)] border-b border-[var(--card-border)] cursor-move"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center space-x-2">
            <GripHorizontal className="w-3 h-3 text-[var(--muted)]" />
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: habit?.color || '#6366F1' }}
            />
            <span className="text-xs font-medium text-[var(--foreground)] truncate max-w-[80px]">
              {habit?.name || 'Timer'}
            </span>
          </div>
          <div className="flex items-center space-x-0.5">
            <button
              onClick={toggleExpand}
              className="p-0.5 rounded hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="p-0.5 rounded hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Compact content */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between space-x-3">
            <motion.div
              className={cn(
                'text-lg font-mono font-bold tabular-nums',
                isCompleted ? 'text-[var(--success)]' : 'text-[var(--foreground)]'
              )}
            >
              {formatElapsedTime(isRunning ? Math.floor(displaySeconds / 60) : currentMinutes)}
            </motion.div>

            <button
              onClick={toggle}
              className={cn(
                'p-2 rounded-full transition-all shadow',
                isRunning
                  ? 'bg-[var(--warning)] text-white hover:bg-[var(--warning)]/80'
                  : 'bg-[var(--success)] text-white hover:bg-[var(--success)]/80'
              )}
            >
              {isRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>

          {/* Mini progress bar */}
          <div className="h-1 bg-[var(--card-border)] rounded-full overflow-hidden mt-2">
            <motion.div
              className={cn(
                'h-full rounded-full',
                isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
