'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StreakCounter({ streak, size = 'md', showLabel = true }: StreakCounterProps) {
  if (streak === 0) return null;

  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'flex items-center space-x-1 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full px-2 py-1',
        sizes[size]
      )}
    >
      <span className="font-bold">{streak}</span>
      {showLabel && (
        <span className={cn('opacity-90', fontSizes[size])}>
          {streak === 1 ? 'day' : 'days'}
        </span>
      )}
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        className="text-sm"
      >
        🔥
      </motion.span>
    </motion.div>
  );
}

interface MiniStreakProps {
  streak: number;
}

export function MiniStreak({ streak }: MiniStreakProps) {
  if (streak < 3) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center space-x-1 text-[var(--warning)]"
    >
      <span className="text-sm">🔥</span>
      <span className="text-xs font-medium">{streak}</span>
    </motion.span>
  );
}
