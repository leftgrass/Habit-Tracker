'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, BarChart3, Settings } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const { uiState, toggleAnalytics, toggleCalendar, toggleSettings } = useHabitStore();
  const { isAnalyticsOpen, isCalendarOpen, isSettingsOpen, isHabitModalOpen } = uiState;

  const handleCalendarClick = () => {
    if (isCalendarOpen) {
      toggleCalendar(false);
    } else {
      toggleCalendar(true);
      toggleAnalytics(false);
      toggleSettings(false);
    }
  };

  const handleAnalyticsClick = () => {
    if (isAnalyticsOpen) {
      toggleAnalytics(false);
    } else {
      toggleAnalytics(true);
      toggleCalendar(false);
      toggleSettings(false);
    }
  };

  const handleSettingsClick = () => {
    if (isSettingsOpen) {
      toggleSettings(false);
    } else {
      toggleSettings(true);
      toggleCalendar(false);
      toggleAnalytics(false);
    }
  };

  const handleHomeClick = () => {
    // Close all panels when clicking home
    toggleCalendar(false);
    toggleAnalytics(false);
    toggleSettings(false);
  };

  return (
    <motion.div 
      initial={{ y: 100 }} 
      animate={{ y: isHabitModalOpen ? 200 : 0 }} 
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
    >
      <div className="bg-[var(--card-bg)]/95 backdrop-blur-lg border-t border-[var(--card-border)] mx-2 mb-2 rounded-2xl">
        <div className="flex items-center justify-around py-1">
          <NavItem icon={Home} label="Today" active={!isAnalyticsOpen && !isCalendarOpen && !isSettingsOpen} onClick={handleHomeClick} />
          <NavItem icon={Calendar} label="Calendar" active={isCalendarOpen} onClick={handleCalendarClick} />
          <NavItem icon={BarChart3} label="Stats" active={isAnalyticsOpen} onClick={handleAnalyticsClick} />
          <NavItem icon={Settings} label="Settings" active={isSettingsOpen} onClick={handleSettingsClick} />
        </div>
      </div>
    </motion.div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} className={cn('flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px]', active ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--muted)] hover:text-[var(--foreground)]')}>
      <Icon className="w-5 h-5" />
      <span className="text-[9px] mt-0.5">{label}</span>
    </motion.button>
  );
}

export function MobileFab() {
  const { toggleHabitModal, uiState } = useHabitStore();
  const { isHabitModalOpen } = uiState;

  return (
    <motion.button 
      initial={{ scale: 0 }} 
      animate={{ scale: isHabitModalOpen ? 0 : 1 }} 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }} 
      onClick={() => toggleHabitModal(true)} 
      className="fixed bottom-18 right-4 z-40 w-12 h-12 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </motion.button>
  );
}
