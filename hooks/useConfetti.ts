import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const hasTriggeredRef = useRef<Set<string>>(new Set());

  const triggerConfetti = useCallback((habitId: string, date: string) => {
    const key = `${habitId}-${date}`;
    
    // Only trigger once per habit-date combination
    if (hasTriggeredRef.current.has(key)) {
      return;
    }
    hasTriggeredRef.current.add(key);

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const resetTrigger = (habitId: string, date: string) => {
    const key = `${habitId}-${date}`;
    hasTriggeredRef.current.delete(key);
  };

  const triggerAchievementConfetti = useCallback(() => {
    const duration = 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#EC4899', '#10B981', '#3B82F6', '#8B5CF6'],
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return { triggerConfetti, resetTrigger, triggerAchievementConfetti };
}
