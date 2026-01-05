'use client';

import { useEffect, useRef } from 'react';
import { useConfetti } from '@/hooks/useConfetti';
import { useHabitStore } from '@/store/useHabitStore';

export function AchievementConfetti() {
  const { achievements } = useHabitStore();
  const { triggerAchievementConfetti } = useConfetti();
  const hasTriggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    achievements.forEach((achievement) => {
      const key = `achievement-${achievement.id}`;
      
      if (hasTriggeredRef.current.has(key)) {
        return;
      }

      if (achievement.progress >= achievement.target) {
        hasTriggeredRef.current.add(key);
        triggerAchievementConfetti();
      }
    });
  }, [achievements, triggerAchievementConfetti]);

  return null;
}
