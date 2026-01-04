'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { WeeklyGrid } from '@/components/habits/WeeklyGrid';
import { HabitModal } from '@/components/habits/HabitModal';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel';
import { CalendarPanel } from '@/components/calendar/CalendarPanel';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { Tour } from '@/components/tour/Tour';

export default function Home() {
  const { habits, toggleHabitModal, uiState, setViewMode, getWeeklyStats, achievements, toggleSettings, toggleAnalytics, toggleCalendar, activeTimer } = useHabitStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeHabits = habits.filter(h => !h.isArchived);
  const stats = getWeeklyStats();
  const isAnyTimerRunning = activeTimer?.isRunning || false;

  const recentAchievements = achievements
    .filter(a => a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <>
      <Tour />
      <HabitModal />
      <SettingsPanel />
      <AnalyticsPanel />
      <CalendarPanel />
        <ClientOnly>
          <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--card-bg)] to-[var(--background)] transition-all duration-300">
          <header className={cn(
            "sticky top-0 z-40 bg-[var(--card-bg)]/80 backdrop-blur-lg border-b border-[var(--card-border)] transition-all duration-300",
            isAnyTimerRunning && "dimmed-element"
          )}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-[var(--secondary)]"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--logo-gradient-from)] via-[var(--logo-gradient-via)] to-[var(--logo-gradient-to)] bg-clip-text text-transparent logo-gradient">
                    Habit Tracker
                  </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  data-tour="add-habit"
                  onClick={() => toggleHabitModal(true)}
                  className="flex items-center space-x-2"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <Plus className="w-5 h-5" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))' }} />
                  <span className="hidden sm:inline" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)' }}>Add Habit</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div data-tour="stats" className={cn(
            "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-300",
            isAnyTimerRunning && "dimmed-element"
          )}>
            <Card hover>
              <CardContent className="text-center py-6">
                <CircularProgress progress={stats.weeklyCompletionRate} size={80} color="var(--primary)" />
                <p className="text-sm text-[var(--muted)] mt-3">Weekly Progress</p>
              </CardContent>
            </Card>
            
            <Card hover>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold text-[var(--foreground)]">{activeHabits.length}</p>
                <p className="text-sm text-[var(--muted)] mt-3">Active Habits</p>
              </CardContent>
            </Card>
            
            <Card hover>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold text-[var(--success)]">{stats.completedToday}</p>
                <p className="text-sm text-[var(--muted)] mt-3">Completed Today</p>
              </CardContent>
            </Card>
            
            <Card hover>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold streak-color">+{stats.currentStreak}</p>
                <p className="text-sm text-[var(--muted)] mt-3">Best Streak</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div data-tour="weekly-grid" className={cn(
              "lg:col-span-2 transition-all duration-300",
              isAnyTimerRunning && "timer-focused"
            )}>
              <WeeklyGrid />
            </div>

            <div className={cn(
              "space-y-6 transition-opacity duration-300",
              isAnyTimerRunning && "dimmed-element"
            )}>
              <Card>
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4" data-tour="achievements">Recent Achievements</h3>
                  <div className="space-y-3">
                    {recentAchievements.length === 0 ? (
                      <p className="text-[var(--muted)] text-center py-4">
                        Complete habits to unlock achievements!
                      </p>
                    ) : (
                      recentAchievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center space-x-3 p-3 bg-[var(--secondary)] rounded-lg"
                        >
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-[var(--foreground)]">{achievement.name}</p>
                            <p className="text-xs text-[var(--muted)]">{achievement.description}</p>
                            <div className="w-full bg-[var(--card-border)] rounded-full h-1.5 mt-2">
                              <div
                                className="bg-[var(--primary)] h-1.5 rounded-full transition-all"
                                style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      data-tour="calendar"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleCalendar(true);
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      View Calendar
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleAnalytics(true);
                      }}
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Analytics
                    </Button>
                    <Button
                      data-tour="settings"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleSettings(true);
                      }}
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
                <CardContent className="py-6">
                  <p 
                    className="text-lg font-medium text-white text-center"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                    }}
                  >
                    {stats.completionRate === 100
                      ? "Amazing! You are on fire! "
                      : stats.completionRate >= 50
                      ? "Great progress! Keep it up! "
                      : "Every small step counts. You have got this! "}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </ClientOnly>
    </>
  );
}
