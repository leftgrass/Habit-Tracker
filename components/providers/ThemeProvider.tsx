'use client';

import React, { useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { uiState } = useHabitStore();
  const { theme } = uiState;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
