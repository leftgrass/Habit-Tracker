'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '@/store/useHabitStore';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, isBefore, startOfDay } from 'date-fns';
import { cn, formatTimeWithSeconds } from '@/lib/utils';
import { Trash2, Edit2, MoreVertical, ChevronLeft, ChevronRight, Clock, Flame, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { TimeTracker } from './TimeTracker';
import { FocusedTimer } from './FocusedTimer';
import { useConfetti } from '@/hooks/useConfetti';

interface ContextMenuProps {
  x: number;
  y: number;
  habitId: string;
  onClose: () => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

interface HabitCardProps {
  habit: any;
  selectedDateStr: string;
  isAnyTimerRunning: boolean;
  activeTimer: any;
  activeHabits: any[];
  weekDates: any[];
  onTimeChange: (mins: number, habitId: string, selectedDateStr: string) => void;
  onContextMenu: (e: React.MouseEvent, habitId: string) => void;
  onEditHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onMoveUp: (habitId: string) => void;
  onMoveDown: (habitId: string) => void;
  triggerConfetti: (habitId: string, date: string) => void;
  resetTrigger: (habitId: string, date: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

function HabitCard({
  habit,
  selectedDateStr,
  isAnyTimerRunning,
  activeTimer,
  activeHabits,
  weekDates,
  onTimeChange,
  onContextMenu,
  onEditHabit,
  onDeleteHabit,
  onMoveUp,
  onMoveDown,
  triggerConfetti,
  resetTrigger,
  isFirst,
  isLast,
}: HabitCardProps) {
  const minutesSpent = habit.completions[selectedDateStr] || 0;
  const isCompleted = minutesSpent >= habit.targetMinutes;
  const streak = habit.currentStreak;

  const handleTimeChange = (mins: number) => {
    onTimeChange(mins, habit.id, selectedDateStr);

    if (mins >= habit.targetMinutes && !isCompleted) {
      triggerConfetti(habit.id, selectedDateStr);
    } else if (mins < habit.targetMinutes && isCompleted) {
      resetTrigger(habit.id, selectedDateStr);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onContextMenu={(e) => onContextMenu(e, habit.id)}
      className={cn(
        'bg-[var(--secondary)] rounded-xl p-4 transition-all duration-200 hover:bg-[var(--card-border)] cursor-context-menu relative overflow-hidden',
        isCompleted && 'ring-2 ring-[var(--success)]/50',
        isAnyTimerRunning && activeTimer?.habitId !== habit.id && "dimmed-element",
        activeTimer?.habitId === habit.id && activeTimer?.date === selectedDateStr && "timer-running-card"
      )}
    >
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[var(--success)]/5"
        />
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-2">
          {/* Up/Down buttons */}
          <div className="flex flex-col space-y-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(habit.id);
              }}
              disabled={isFirst}
              className="p-0.5 rounded hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(habit.id);
              }}
              disabled={isLast}
              className="p-0.5 rounded hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>

          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <span className="font-semibold text-[var(--foreground)]">{habit.name}</span>

          {streak > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-[var(--warning)] to-[var(--accent)] rounded-full"
            >
              <Flame className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">{streak}</span>
              <span className="text-xs text-white/80">
                {streak === 1 ? 'day' : 'days'}
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1 px-2 py-1 bg-[var(--success)]/20 rounded-lg"
            >
              <Trophy className="w-4 h-4 text-[var(--success)]" />
              <span className="text-sm font-medium text-[var(--success)]">Goal Met!</span>
            </motion.div>
          )}
          <span className="text-sm text-[var(--muted)]">
            {`${formatTimeWithSeconds(Object.values(habit.completions).reduce((sum: number, m: any) => sum + (m || 0), 0))} total`}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, habit.id);
            }}
            className="p-1 rounded hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={cn(
        'rounded-xl p-6 relative z-10 transition-all duration-300',
        isCompleted
          ? 'bg-[var(--success)]/20 border-2 border-[var(--success)]'
          : 'bg-[var(--card-bg)] border-2 border-[var(--card-border)]',
        activeTimer?.habitId === habit.id && activeTimer?.date === selectedDateStr && "timer-focused"
      )}>
        <TimeTracker
          currentMinutes={minutesSpent}
          targetMinutes={habit.targetMinutes}
          onChange={handleTimeChange}
          habitId={habit.id}
          date={selectedDateStr}
        />
      </div>

    </motion.div>
  );
}

function ContextMenu({ x, y, habitId, onClose, onEdit, onDelete }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const adjustedX = x > window.innerWidth - 200 ? x - 180 : x;
  const adjustedY = y > window.innerHeight - 150 ? y - 120 : y;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[var(--card-bg)] rounded-lg shadow-xl border border-[var(--card-border)] py-1 min-w-[140px]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <button
        onClick={() => {
          onEdit(habitId);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] flex items-center space-x-2"
      >
        <Edit2 className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button
        onClick={() => {
          onDelete(habitId);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );
}

export function WeeklyGrid() {
  const { habits, toggleHabitCompletion, uiState, toggleHabitModal, deleteHabit, setFocusedTimer, activeTimer, moveHabitUp, moveHabitDown } = useHabitStore();

  const activeHabits = useMemo(() => {
    return habits.filter(h => !h.isArchived);
  }, [habits]);

  const isAnyTimerRunning = activeTimer?.isRunning || false;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; habitId: string } | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    return start;
  });
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const { triggerConfetti, resetTrigger } = useConfetti();

  // Filter habits for the selected date based on scheduleDays
  const habitsForSelectedDate = useMemo(() => {
    const selectedDayName = format(selectedDate, 'EEE');
    return activeHabits.filter(habit => {
      // Daily habits show every day
      if (habit.frequency === 'daily') return true;
      // Weekly/custom habits only show on their scheduled days
      return habit.scheduleDays.includes(selectedDayName);
    });
  }, [activeHabits, selectedDate]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 0 });
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStart]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToToday = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    setCurrentWeekStart(start);
    setSelectedDate(startOfDay(today));
  };

  const handleContextMenu = (e: React.MouseEvent, habitId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, habitId });
  };

  const handleEditHabit = (habitId: string) => {
    toggleHabitModal(true, habitId);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habitId);
    }
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedDateFuture = isBefore(startOfDay(new Date()), selectedDate);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-[var(--card-bg)] rounded-2xl shadow-lg p-6 transition-all duration-300",
          isAnyTimerRunning && "timer-active timer-focused"
        )}
      >
        <div className={cn(
          "flex items-center justify-between mb-6 transition-opacity duration-300",
          isAnyTimerRunning && "dimmed-element"
        )}>
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Weekly View</h2>
            <div className="flex items-center space-x-1 bg-[var(--secondary)] rounded-lg p-1">
              <button
                onClick={goToPreviousWeek}
                className="p-2 rounded-md hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 rounded-md text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-border)] transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextWeek}
                className="p-2 rounded-md hover:bg-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
          </p>
        </div>

        <div className={cn(
          "flex space-x-2 mb-6 transition-opacity duration-300",
          isAnyTimerRunning && "dimmed-element"
        )}>
          {weekDates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = isSameDay(date, selectedDate);
            const isDateToday = isToday(date);
            const isDateFuture = isBefore(startOfDay(new Date()), date);

            const dayProgress = activeHabits.length > 0
              ? (activeHabits.filter(h => (h.completions[dateStr] || 0) >= h.targetMinutes).length / activeHabits.length) * 100
              : 0;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'flex-1 py-3 px-2 rounded-lg border-2 transition-all relative overflow-hidden',
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--card-border)] hover:border-[var(--primary)]/50',
                  isDateFuture && 'opacity-50'
                )}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className={cn(
                      'text-xs font-medium uppercase',
                      isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
                    )}>
                      {format(date, 'EEE')}
                    </span>
                    {isDateToday && (
                      <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                    )}
                  </div>
                  <div className={cn(
                    'text-center text-lg font-bold',
                    isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                  )}>
                    {format(date, 'd')}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--card-border)]">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      dayProgress === 100 ? 'bg-[var(--success)]' :
                      dayProgress >= 50 ? 'bg-[var(--warning)]' :
                      dayProgress > 0 ? 'bg-[var(--primary)]' : 'bg-transparent'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${dayProgress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className={cn(
          "flex items-center justify-center mb-4 transition-opacity duration-300",
          isAnyTimerRunning && "dimmed-element"
        )}>
          <Clock className="w-5 h-5 text-[var(--primary)] mr-2" />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {isSelectedDateFuture && (
            <span className="ml-2 text-xs text-[var(--muted)]">(Future)</span>
          )}
        </div>

        <div className="space-y-4">
          {habitsForSelectedDate.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No habits scheduled for today</h3>
              <p className="text-[var(--muted)] mb-4">
                {activeHabits.length > 0 
                  ? "You don't have any habits scheduled for this day. Check your weekly schedule in habit settings."
                  : "Start building better habits by adding your first one!"}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {habitsForSelectedDate.map((habit, index) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  selectedDateStr={selectedDateStr}
                  isAnyTimerRunning={isAnyTimerRunning}
                  activeTimer={activeTimer}
                  activeHabits={habitsForSelectedDate}
                  weekDates={weekDates}
                  onTimeChange={(mins, habitId, dateStr) => toggleHabitCompletion(habitId, dateStr, mins)}
                  onContextMenu={handleContextMenu}
                  onEditHabit={handleEditHabit}
                  onDeleteHabit={handleDeleteHabit}
                  onMoveUp={moveHabitUp}
                  onMoveDown={moveHabitDown}
                  triggerConfetti={triggerConfetti}
                  resetTrigger={resetTrigger}
                  isFirst={index === 0}
                  isLast={index === habitsForSelectedDate.length - 1}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            habitId={contextMenu.habitId}
            onClose={() => setContextMenu(null)}
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
          />
        )}
      </AnimatePresence>

      {uiState.focusedTimer?.habitId && uiState.focusedTimer?.date && (
        <FocusedTimer
          habitId={uiState.focusedTimer.habitId}
          date={uiState.focusedTimer.date}
          onClose={() => setFocusedTimer(null, null)}
        />
      )}
    </>
  );
}
