'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, Maximize2, Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { useHabitStore } from '@/store/useHabitStore';

interface TimeTrackerProps {
  currentMinutes: number;
  targetMinutes: number;
  onChange: (minutes: number) => void;
  habitId: string;
  date: string;
  onPopOut?: () => void;
  onPlay?: () => void;
}

function formatTime(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return '0m';
  }
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  const s = Math.floor((totalMinutes * 60) % 60);
  
  if (h > 0) {
    return s > 0 ? `${h}h ${m}m ${s}s` : `${h}h ${m}m`;
  }
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatElapsedTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  const s = Math.floor((totalMinutes * 60) % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimeTracker({
  currentMinutes,
  targetMinutes,
  onChange,
  habitId,
  date,
  onPopOut,
  onPlay,
}: TimeTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const { isRunning, elapsed, toggle, reset, setElapsed } = useTimer({
    habitId,
    date,
    onTick: (mins) => {
      onChange(mins);
    },
  });

  const { resetTimer, setTimerAccumulatedTime } = useHabitStore();

  const safeCurrentMinutes = isNaN(currentMinutes) ? 0 : Math.max(0, currentMinutes);
  const safeTargetMinutes = isNaN(targetMinutes) ? 1 : Math.max(1, targetMinutes);
  
  const displayMinutes = isRunning ? elapsed / 60 : safeCurrentMinutes;
  
  const progress = Math.min((displayMinutes / safeTargetMinutes) * 100, 100);
  const isCompleted = displayMinutes >= safeTargetMinutes;

  const startEditing = () => {
    setEditValue(formatElapsedTime(safeCurrentMinutes));
    setIsEditing(true);
  };

  const saveEdit = () => {
    const parts = editValue.split(':').map(Number);
    let totalMins = 0;
    
    if (parts.length === 3 && !parts.some(isNaN)) {
      totalMins = parts[0] * 60 + parts[1] + parts[2] / 60;
    } else if (parts.length === 2 && !parts.some(isNaN)) {
      totalMins = parts[0] * 60 + parts[1];
    }
    
    if (isNaN(totalMins) || totalMins < 0) totalMins = 0;
    if (totalMins > 720) totalMins = 720;
    
    onChange(totalMins);
    setTimerAccumulatedTime(totalMins);
    setElapsed(totalMins * 60);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const handleReset = () => {
    onChange(0);
    resetTimer();
    reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editValue}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9:]/g, '');
                const parts = value.split(':');
                const filtered = parts.map(p => p.slice(0, 2)).join(':').slice(0, 8);
                setEditValue(filtered);
              }}
              onKeyDown={handleEditKeyDown}
              autoFocus
              className="text-3xl font-mono font-bold bg-transparent border-b-2 border-[var(--primary)] outline-none tabular-nums w-48 text-center"
            />
            <button
              onClick={saveEdit}
              className="p-2 rounded-full bg-[var(--success)] text-white hover:bg-[var(--success)]/80 transition-all"
              title="Save"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={cancelEdit}
              className="p-2 rounded-full bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="text-3xl font-mono font-bold tabular-nums">
              {formatElapsedTime(displayMinutes)}
            </div>
            {!isRunning && (
              <button
                onClick={startEditing}
                className="p-1.5 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                title="Edit time"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  toggle();
                  if (!isRunning && onPlay) {
                    onPlay();
                  }
                }}
                className={cn(
                  'p-2 rounded-full transition-all timer-button',
                  isRunning
                    ? 'bg-[var(--warning)] text-white hover:bg-[var(--warning)]/80'
                    : 'bg-[var(--success)] text-white hover:bg-[var(--success)]/80'
                )}
                title={isRunning ? 'Pause Timer' : 'Start Timer'}
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-full bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all timer-button"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              {onPopOut && (
                <button
                  onClick={onPopOut}
                  className="p-2 rounded-full bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--card-border)] transition-all timer-button"
                  title="Pop out timer"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm">
        <Clock className="w-4 h-4 text-[var(--muted)]" />
        <span className="text-[var(--muted)]">
          Target: {formatTime(targetMinutes)}
        </span>
        {isRunning && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs px-2 py-0.5 bg-[var(--success)] text-white rounded-full"
          >
            Timer Running
          </motion.span>
        )}
      </div>

      <div className="relative">
        <div className="h-3 bg-[var(--card-border)] rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full transition-colors',
              isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </div>
  );
}
