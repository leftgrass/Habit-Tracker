'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, BarChart3, Settings, Menu, X, Sparkles, Clock, Flame } from 'lucide-react';
import { format } from 'date-fns';
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
import { AchievementConfetti } from '@/components/AchievementConfetti';
import { MobileNav, MobileFab } from '@/components/MobileNav';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';

export default function Home() {
  const { habits, toggleHabitModal, uiState, getWeeklyStats, achievements, toggleSettings, toggleAnalytics, toggleCalendar, activeTimer } = useHabitStore();
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
      <WelcomeOverlay />
      <Tour />
      <AchievementConfetti />
      <HabitModal />
      <SettingsPanel />
      <AnalyticsPanel />
      <CalendarPanel />
      <ClientOnly>
        <MobileNav />
        <MobileFab />
        <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--card-bg)] to-[var(--background)] transition-all duration-300 pb-24 md:pb-0">
          <header className={cn(
            "sticky top-0 z-40 bg-[var(--card-bg)]/80 backdrop-blur-xl transition-all duration-300 hidden md:block",
            isAnyTimerRunning && "dimmed-element"
          )}>
            <div className="relative overflow-hidden">
              {/* Decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--logo-gradient-from)] via-[var(--logo-gradient-via)] to-[var(--logo-gradient-to)]" />

              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Left - Logo */}
                  <motion.div
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="flex items-center gap-3 flex-shrink-0"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--logo-gradient-from)] to-[var(--logo-gradient-to)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--logo-gradient-from)] via-[var(--logo-gradient-via)] to-[var(--logo-gradient-to)] bg-clip-text text-transparent logo-gradient whitespace-nowrap">
                      Habit Tracker
                    </h1>
                  </motion.div>

                  {/* Center - Unified Status Card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-start -ml-28"
                  >
                      <div className="bg-[var(--secondary)]/60 backdrop-blur-sm rounded-2xl pl-5 pr-6 py-3 border border-[var(--card-border)]/50 -ml-1" data-tour="header-stats">
                      <div className="flex items-center gap-6">
                        {/* Greeting */}
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[var(--foreground)]">
                              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
                            </span>
                             <span className="text-sm font-medium text-[var(--muted)]">
                               {format(new Date(), 'EEEE, MMMM d')}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-10 bg-[var(--card-border)]/50" />

                        {/* Stats */}
                        <div className="flex items-center gap-6 -ml-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-[var(--success)]/15 flex items-center justify-center">
                              <Clock className="w-4 h-4 text-[var(--success)]" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-medium text-[var(--foreground)]">Today</span>
                               <span className="text-sm font-bold text-[var(--muted)]">
                                {stats.completedToday}/{stats.totalHabits}
                              </span>
                            </div>
                          </div>

                          {true && (
                            <>
                              <div className="w-px h-8 bg-[var(--card-border)]/50" />
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--warning)] to-[var(--accent)]/50 flex items-center justify-center">
                                  <Flame className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-xs font-medium text-[var(--foreground)]">Streak</span>
                                  <span className="text-sm font-bold text-[var(--streak-color)]">
                                    {stats.currentStreak}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                   {/* Right - Add Habit Button */}
                   <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 }}
                     className="flex-shrink-0"
                   >
                       <Button
                         data-tour="add-habit"
                         onClick={() => toggleHabitModal(true)}
                        className="flex items-center space-x-2 shadow-lg shadow-[var(--primary)]/25 hover:shadow-[var(--primary)]/40 transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        <Plus className="w-5 h-5" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))' }} />
                         <span style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)' }}>Add Habit</span>
                      </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-4 md:py-8">
            <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 transition-all duration-300", isAnyTimerRunning && "dimmed-element")} data-tour="stats">
              <Card hover>
                <CardContent className="text-center py-4 md:py-6">
                  <CircularProgress progress={stats.weeklyCompletionRate} size={64} color="var(--primary)" />
                  <p className="text-xs md:text-sm text-[var(--muted)] mt-2 md:mt-3">Weekly Progress</p>
                </CardContent>
              </Card>
              
              <Card hover>
                <CardContent className="text-center py-4 md:py-6">
                  <p className="text-2xl md:text-4xl font-bold text-[var(--foreground)]">{activeHabits.length}</p>
                  <p className="text-xs md:text-sm text-[var(--muted)] mt-2 md:mt-3">Active Habits</p>
                </CardContent>
              </Card>
              
              <Card hover>
                <CardContent className="text-center py-4 md:py-6">
                  <p className="text-2xl md:text-4xl font-bold text-[var(--success)]">{stats.completedToday}</p>
                  <p className="text-xs md:text-sm text-[var(--muted)] mt-2 md:mt-3">Completed Today</p>
                </CardContent>
              </Card>
              
              <Card hover>
                <CardContent className="text-center py-4 md:py-6">
                  <p className="text-2xl md:text-4xl font-bold streak-color">+{stats.currentStreak}</p>
                  <p className="text-xs md:text-sm text-[var(--muted)] mt-2 md:mt-3">Best Streak</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div data-tour="weekly-grid" className={cn(
                "lg:col-span-2 transition-all duration-300 order-2 md:order-1",
                isAnyTimerRunning && "timer-focused"
              )}>
                <WeeklyGrid />
              </div>

              <div className={cn(
                "space-y-4 md:space-y-6 transition-opacity duration-300 order-1 md:order-2",
                isAnyTimerRunning && "dimmed-element"
              )}>
                <Card className="md:hidden">
                  <CardContent className="py-4">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent Achievements</h3>
                    {recentAchievements.length === 0 ? (
                      <p className="text-[var(--muted)] text-center py-2">
                        Complete habits to unlock achievements!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {recentAchievements.slice(0, 2).map((achievement) => (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-3 p-3 bg-[var(--secondary)] rounded-lg"
                          >
                            <span className="text-xl">{achievement.icon}</span>
                            <div className="flex-1">
                              <p className="font-medium text-[var(--foreground)] text-sm">{achievement.name}</p>
                              <div className="w-full bg-[var(--card-border)] rounded-full h-1.5 mt-1">
                                <div
                                  className="bg-[var(--primary)] h-1.5 rounded-full transition-all"
                                  style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="hidden md:block">
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

                <Card className="md:hidden">
                  <CardContent className="py-4">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="primary"
                        onClick={() => toggleHabitModal(true)}
                        className="py-3"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toggleCalendar(true)}
                        className="py-3"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Calendar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toggleAnalytics(true)}
                        className="py-3"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Stats
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toggleSettings(true)}
                        className="py-3"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hidden md:block">
                  <CardContent className="py-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        data-tour="add-habit"
                        variant="primary"
                        className="flex items-center space-x-2 w-full"
                        onClick={() => toggleHabitModal(true)}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Habit
                      </Button>
                      <Button
                        data-tour="calendar"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toggleCalendar(true)}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        View Calendar
                      </Button>
                      <Button
                        data-tour="analytics"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toggleAnalytics(true)}
                      >
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Analytics
                      </Button>
                      <Button
                        data-tour="settings"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toggleSettings(true)}
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card data-tour="quote" className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
                  <CardContent className="py-4 md:py-6">
                    <p 
                      className="text-base md:text-lg font-medium text-white text-center"
                      style={{
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                      }}
                    >
                      {stats.completionRate === 100
                        ? "Amazing! You are on fire!"
                        : stats.completionRate >= 50
                        ? "Great progress! Keep it up!"
                        : "Every small step counts. You've got this!"}
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
