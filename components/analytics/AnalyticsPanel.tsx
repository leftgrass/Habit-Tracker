'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Target, Award, Flame } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function AnalyticsPanel() {
  const { uiState, toggleAnalytics, habits } = useHabitStore();
  const { isAnalyticsOpen } = uiState;

  const activeHabits = useMemo(() => habits.filter(h => !h.isArchived), [habits]);

  const last30Days = useMemo(() => {
    const today = new Date();
    return eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });
  }, []);

  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    last30Days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      // A day is complete if minutes >= target for all habits
      const completedHabits = activeHabits.filter(h => (h.completions[dateStr] || 0) >= h.targetMinutes).length;
      data[dateStr] = activeHabits.length > 0 ? (completedHabits / activeHabits.length) * 100 : 0;
    });
    return data;
  }, [activeHabits, last30Days]);

  const habitStats = useMemo(() => {
    return activeHabits.map(habit => {
      const totalMinutes = Object.values(habit.completions).reduce((sum, m) => sum + (m || 0), 0);
      const totalSeconds = Math.round(totalMinutes * 60);
      const daysTracked = Object.keys(habit.completions).length;
      const daysMet = Object.values(habit.completions).filter(m => (m || 0) >= habit.targetMinutes).length;
      const completionRate = daysTracked > 0 ? (daysMet / daysTracked) * 100 : 0;
      const bestStreak = habit.longestStreak;
      const currentStreak = habit.currentStreak;

      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      const totalTimeString = hours > 0 
        ? `${hours}h ${mins}m ${secs}s`
        : `${mins}m ${secs}s`;

      return { ...habit, totalMinutes, totalSeconds, totalTimeString, daysMet, bestStreak, currentStreak, completionRate };
    }).sort((a, b) => b.totalSeconds - a.totalSeconds);
  }, [activeHabits]);

  const overallStats = useMemo(() => {
    const totalSeconds = activeHabits.reduce((sum, h) => sum + (h.totalMinutes || 0) * 60, 0);
    const totalRounded = Math.round(totalSeconds);
    const avgStreak = activeHabits.length > 0
      ? activeHabits.reduce((sum, h) => sum + h.currentStreak, 0) / activeHabits.length
      : 0;
    const bestHabit = habitStats[0];
    const hours = Math.floor(totalRounded / 3600);
    const mins = Math.floor((totalRounded % 3600) / 60);
    const secs = totalRounded % 60;

    return { 
      totalSeconds: totalRounded,
      totalTimeString: hours > 0 
        ? `${hours}h ${mins}m ${secs}s` 
        : `${mins}m ${secs}s`,
      avgStreak: Math.round(avgStreak * 10) / 10, 
      bestHabit 
    };
  }, [activeHabits, habitStats]);

  const getHeatmapColor = (percentage: number) => {
    if (percentage === 0) return 'bg-[var(--card-border)]';
    if (percentage < 25) return 'bg-[var(--danger)]/40';
    if (percentage < 50) return 'bg-[var(--warning)]/40';
    if (percentage < 75) return 'bg-[var(--success)]/40';
    return 'bg-[var(--success)]';
  };

  if (!isAnalyticsOpen) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <AnimatePresence>
      {isAnalyticsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => toggleAnalytics(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full bg-[var(--card-bg)] shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">Analytics</h2>
                  <p className="text-sm text-[var(--muted)]">Track your progress and insights</p>
                </div>
                <button
                  onClick={() => toggleAnalytics(false)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80">Total Time</p>
                          <p className="text-3xl font-bold mt-1">{overallStats.totalTimeString}</p>
                        </div>
                        <Target className="w-10 h-10 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted)]">Avg Streak</p>
                          <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{overallStats.avgStreak}</p>
                        </div>
                        <Flame className="w-10 h-10 text-[var(--warning)]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted)]">Best Habit</p>
                          <p className="text-lg font-bold text-[var(--foreground)] mt-1 truncate">
                            {overallStats.bestHabit?.name || 'None'}
                          </p>
                        </div>
                        <Award className="w-10 h-10 text-[var(--accent)]" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[var(--muted)]">Active Habits</p>
                          <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{activeHabits.length}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-[var(--success)]" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Last 30 Days</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-10 gap-1">
                        {last30Days.map((day, index) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const percentage = heatmapData[dateStr] || 0;
                          const isToday = dateStr === todayStr;

                          return (
                            <div
                              key={index}
                              className={`aspect-square rounded-sm ${getHeatmapColor(percentage)} ${
                                isToday ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''
                              }`}
                              title={`${format(day, 'MMM d')}: ${Math.round(percentage)}%`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-4 text-xs text-[var(--muted)]">
                        <span>{format(last30Days[0], 'MMM d')}</span>
                        <div className="flex items-center space-x-2">
                          <span>Less</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-sm bg-[var(--card-border)]" />
                            <div className="w-3 h-3 rounded-sm bg-[var(--danger)]/40" />
                            <div className="w-3 h-3 rounded-sm bg-[var(--warning)]/40" />
                            <div className="w-3 h-3 rounded-sm bg-[var(--success)]/40" />
                            <div className="w-3 h-3 rounded-sm bg-[var(--success)]" />
                          </div>
                          <span>More</span>
                        </div>
                        <span>{format(last30Days[29], 'MMM d')}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Weekly Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {habitStats.length === 0 ? (
                          <p className="text-[var(--muted)] text-center py-4">No habits yet</p>
                        ) : (
                          habitStats.slice(0, 5).map((habit, index) => {
                            const percentage = Math.round(habit.completionRate);

                            return (
                              <div key={habit.id} className="flex items-center space-x-3">
                                <span className="text-sm text-[var(--muted)] w-16 truncate">{habit.name}</span>
                                <div className="flex-1">
                                  <div className="h-3 bg-[var(--secondary)] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        percentage === 100
                                          ? 'bg-[var(--success)]'
                                          : percentage >= 50
                                          ? 'bg-[var(--success)]/80'
                                          : percentage >= 25
                                          ? 'bg-[var(--warning)]'
                                          : 'bg-[var(--danger)]'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-[var(--foreground)]">
                                  {percentage}%
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Habit Rankings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {habitStats.length === 0 ? (
                        <p className="text-[var(--muted)] text-center py-4">No habits to analyze yet</p>
                      ) : (
                        habitStats.map((habit, index) => (
                          <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.3) }}
                            className="flex items-center space-x-4 p-3 bg-[var(--secondary)] rounded-lg"
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: habit.color }}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-[var(--foreground)]">{habit.name}</p>
                              <div className="flex items-center space-x-4 text-sm text-[var(--muted)]">
                                <span>{habit.totalTimeString} total</span>
                                <span>{habit.bestStreak} day best</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[var(--foreground)]">{Math.round(habit.completionRate)}%</p>
                              <p className="text-xs text-[var(--muted)]">rate</p>
                            </div>
                          </motion.div>
                        ))
                      )}
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
