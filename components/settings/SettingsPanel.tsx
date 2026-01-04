'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Trash2, Download, Upload, Bell, Lock, HelpCircle, Info, Database } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function SettingsPanel() {
  const { uiState, toggleSettings, setTheme, habits, deleteHabit } = useHabitStore();
  const { isSettingsOpen, theme } = uiState;
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'about'>('general');

  if (!isSettingsOpen) return null;

  const handleExport = () => {
    const data = {
      habits,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all habits? This cannot be undone.')) {
      habits.forEach(h => deleteHabit(h.id));
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Info },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'about', label: 'About', icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => toggleSettings(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full bg-[var(--card-bg)] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Settings</h2>
                <button
                  onClick={() => toggleSettings(false)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-[var(--card-border)]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'general' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Moon className="w-5 h-5" />
                          <span>Appearance</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--foreground)]">Theme</p>
                            <p className="text-sm text-[var(--muted)]">Choose your preferred theme</p>
                          </div>
                          <div className="flex items-center space-x-2 bg-[var(--secondary)] rounded-lg p-1">
                            <button
                              onClick={() => setTheme('light')}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                theme === 'light'
                                  ? 'bg-[var(--card-bg)] text-[var(--primary)] shadow-sm'
                                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <Sun className="w-4 h-4 inline mr-1" />
                              Light
                            </button>
                            <button
                              onClick={() => setTheme('dark')}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                theme === 'dark'
                                  ? 'bg-[var(--card-bg)] text-[var(--primary)] shadow-sm'
                                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <Moon className="w-4 h-4 inline mr-1" />
                              Dark
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Bell className="w-5 h-5" />
                          <span>Notifications</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--foreground)]">Daily Reminders</p>
                            <p className="text-sm text-[var(--muted)]">Get reminded to complete your habits</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--secondary)]">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-[var(--card-bg)] transition translate-x-1" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[var(--foreground)]">Streak Alerts</p>
                            <p className="text-sm text-[var(--muted)]">Don't lose your streak!</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--primary)]">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'data' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Download className="w-5 h-5" />
                          <span>Export Data</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted)] mb-4">
                          Download your habit data as a JSON file for backup or analysis.
                        </p>
                        <Button onClick={handleExport} variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Export All Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Upload className="w-5 h-5" />
                          <span>Import Data</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted)] mb-4">
                          Import habit data from a backup file.
                        </p>
                        <Button variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Import Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-[var(--danger)]">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-[var(--danger)]">
                          <Trash2 className="w-5 h-5" />
                          <span>Danger Zone</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted)] mb-4">
                          Permanently delete all your habits and data. This action cannot be undone.
                        </p>
                        <Button variant="danger" onClick={handleClearAll} className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete All Habits
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {activeTab === 'about' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📊</div>
                          <h3 className="text-xl font-semibold text-[var(--foreground)]">Habit Tracker</h3>
                          <p className="text-sm text-[var(--muted)] mt-1">Version 1.0.0</p>
                          <p className="text-sm text-[var(--muted)] mt-4">
                            A beautiful, simple way to track your daily habits and build better routines.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-[var(--foreground)]">
                          <li>✓ Daily habit tracking with streaks</li>
                          <li>✓ Weekly progress visualization</li>
                          <li>✓ Achievement system</li>
                          <li>✓ Local storage - no account needed</li>
                          <li>✓ Dark mode support</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Lock className="w-5 h-5" />
                          <span>Privacy</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted)]">
                          All your data is stored locally on your device. We never collect or share your personal information.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
