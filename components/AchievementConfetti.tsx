'use client';

import { useEffect } from 'react';
import { useConfetti } from '@/hooks/useConfetti';
import { useHabitStore } from '@/store/useHabitStore';

export function AchievementConfetti() {
  const { achievements } = useHabitStore();
  const { triggerAchievementConfetti } = useConfetti();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    achievements.forEach((achievement) => {
      if (achievement.progress < achievement.target) return;

      const key = `celebrated-${achievement.id}`;
      if (sessionStorage.getItem(key)) return;

      sessionStorage.setItem(key, 'true');
      triggerAchievementConfetti();
    });
  }, [achievements, triggerAchievementConfetti]);

  return null;
}
