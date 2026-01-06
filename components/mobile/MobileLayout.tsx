'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileFab } from './MobileBottomNav';
import { useHabitStore } from '@/store/useHabitStore';
import { MobileHabitModal } from './MobileHabitModal';
import { CalendarPanel } from '@/components/calendar/CalendarPanel';
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { Tour } from '@/components/tour/Tour';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { AchievementConfetti } from '@/components/AchievementConfetti';
import { FocusedTimer } from '@/components/habits/FocusedTimer';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { uiState } = useHabitStore();

  return (
    <div className="mobile-layout">
      <div className="mobile-content">{children}</div>
      <MobileHabitModal />
      <CalendarPanel />
      <AnalyticsPanel />
      <SettingsPanel />
      <Tour />
      <WelcomeOverlay />
      <AchievementConfetti />
      {uiState.focusedTimer?.habitId && uiState.focusedTimer?.date && (
        <FocusedTimer habitId={uiState.focusedTimer.habitId} date={uiState.focusedTimer.date} onClose={() => useHabitStore.getState().setFocusedTimer(null, null)} />
      )}
      <MobileBottomNav />
      <MobileFab />
      <style jsx>{`
        .mobile-layout {
          min-height: 100vh;
          background: var(--card-bg);
        }
        .mobile-content {
          padding-bottom: 100px;
        }
      `}</style>
    </div>
  );
}
