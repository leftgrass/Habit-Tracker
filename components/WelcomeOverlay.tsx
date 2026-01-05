'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { Button } from '@/components/ui/Button';

export function WelcomeOverlay() {
  const { startTour } = useHabitStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeOverlay');
      if (!hasSeenWelcome) {
        setIsVisible(true);
      }
    }
  }, [isMounted]);

  const handleStartTour = () => {
    localStorage.setItem('hasSeenWelcomeOverlay', 'true');
    setIsVisible(false);
    setTimeout(() => {
      startTour();
    }, 300);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="max-w-md w-full text-center pointer-events-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="text-6xl mb-4">🎯</div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome to <span className="bg-gradient-to-r from-[var(--logo-gradient-from)] via-[var(--logo-gradient-via)] to-[var(--logo-gradient-to)] bg-clip-text text-transparent">Habit Tracker</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-lg text-white/80 mb-8 leading-relaxed"
              >
                Your personal journey to building better habits starts here. Track daily routines, build streaks, and achieve your goals one day at a time. 🚀
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex justify-center gap-4 mb-8 text-3xl"
              >
                <span title="Track habits">✅</span>
                <span title="Build streaks">🔥</span>
                <span title="View analytics">📊</span>
                <span title="Earn achievements">🏆</span>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Button
                  onClick={handleStartTour}
                  size="lg"
                  className="group relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Start Tour Guide
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-8 text-sm text-white/60"
              >
                <p>Let&apos;s build something amazing together! ✨</p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
