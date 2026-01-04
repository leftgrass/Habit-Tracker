'use client';

import { useEffect, useRef } from 'react';
import { useConfetti } from '@/hooks/useConfetti';
import { useHabitStore } from '@/store/useHabitStore';

export function AchievementConfetti() {
  const { achievements } = useHabitStore();
  const { triggerAchievementConfetti } = useConfetti();
  const previousProgressRef = useRef<Record<string, number>>({});

  useEffect(() => {
    achievements.forEach((achievement) => {
      const prevProgress = previousProgressRef.current[achievement.id] || 0;
      const justReachedTarget = prevProgress < achievement.target && achievement.progress >= achievement.target;

      if (justReachedTarget) {
        triggerAchievementConfetti();
      }

      previousProgressRef.current[achievement.id] = achievement.progress;
    });
  }, [achievements, triggerAchievementConfetti]);

  return null;
}
