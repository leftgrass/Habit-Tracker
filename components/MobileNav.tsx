'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, BarChart3, Settings } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { uiState, toggleAnalytics, toggleCalendar, toggleSettings } = useHabitStore();
  const { isAnalyticsOpen, isCalendarOpen, isSettingsOpen } = uiState;

  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Calendar, label: 'Calendar', open: isCalendarOpen, onClick: () => toggleCalendar(true) },
    { icon: BarChart3, label: 'Analytics', open: isAnalyticsOpen, onClick: () => toggleAnalytics(true) },
    { icon: Settings, label: 'Settings', open: isSettingsOpen, onClick: () => toggleSettings(true) },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 pb-safe">
      <div className="bg-[var(--card-bg)]/95 backdrop-blur-lg border-t border-[var(--card-border)] px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.9 }}
              onClick={item.onClick}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-[64px]',
                item.active
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MobileFab() {
  const { toggleHabitModal } = useHabitStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => toggleHabitModal(true)}
      className="fixed bottom-20 right-4 md:hidden z-40 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </motion.button>
  );
}
