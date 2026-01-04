'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

export function CalendarPanel() {
  const { uiState, toggleCalendar, habits } = useHabitStore();
  const { isCalendarOpen } = uiState;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const activeHabits = useMemo(() => habits.filter(h => !h.isArchived), [habits]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const getCompletionData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Count habits where minutes >= target
    const completed = activeHabits.filter(h => (h.completions[dateStr] || 0) >= h.targetMinutes).length;
    const total = activeHabits.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  if (!isCalendarOpen) return null;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatePresence>
      {isCalendarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => toggleCalendar(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full bg-[var(--card-bg)] shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-6 h-6 text-[var(--primary)]" />
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">Calendar</h2>
                    <p className="text-sm text-[var(--muted)]">View your habit history</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCalendar(false)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 mb-2">
                  {weekDays.map(day => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-[var(--muted)] py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const { completed, total, percentage } = getCompletionData(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isDayToday = isToday(day);

                    return (
                      <div
                        key={index}
                        className={`
                          aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                          ${isCurrentMonth ? '' : 'opacity-30'}
                          ${isDayToday ? 'ring-2 ring-[var(--primary)]' : ''}
                        `}
                      >
                        <span className={`
                          font-medium mb-1
                          ${isDayToday ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}
                        `}>
                          {format(day, 'd')}
                        </span>
                        {/* Completion indicator */}
                        {total > 0 && (
                          <div className="w-6 h-1 rounded-full overflow-hidden bg-[var(--secondary)]">
                            <div
                              className={`
                                h-full rounded-full
                                ${percentage === 100 ? 'bg-[var(--success)]' : ''}
                                ${percentage >= 50 && percentage < 100 ? 'bg-[var(--warning)]' : ''}
                                ${percentage > 0 && percentage < 50 ? 'bg-[var(--primary)]' : ''}
                                ${percentage === 0 ? 'bg-transparent' : ''}
                              `}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                  <div className="flex items-center justify-center space-x-6 text-sm text-[var(--muted)]">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-transparent" />
                      <span>0%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                      <span>1-49%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
                      <span>50-99%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <Card className="mt-6">
                  <CardContent className="py-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{activeHabits.length}</p>
                        <p className="text-xs text-[var(--muted)]">Active Habits</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--success)]">
                          {calendarDays.filter(d => {
                            const { completed, total } = getCompletionData(d);
                            return total > 0 && completed === total;
                          }).length}
                        </p>
                        <p className="text-xs text-[var(--muted)]">Perfect Days</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--primary)]">
                          {Math.round(
                            calendarDays.reduce((sum, d) => sum + getCompletionData(d).percentage, 0) / 
                            (calendarDays.filter(d => getCompletionData(d).total > 0).length || 1)
                          )}%
                        </p>
                        <p className="text-xs text-[var(--muted)]">Avg Completion</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
