'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { Button } from '@/components/ui/Button';

export const TOUR_STEPS = [
  {
    target: '[data-tour="add-habit"]',
    title: 'Add Your First Habit',
    content: 'Click here to create a new habit. You can set a name, category, frequency, and daily target time.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="header-stats"]',
    title: 'Your Daily Overview',
    content: 'See today\'s date, your habits completed today, and your current streak all in one glance.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="weekly-grid"]',
    title: 'Track Your Progress',
    content: 'Your habits appear here. Click on a day to mark it complete. Each habit shows your current streak!',
    position: 'top' as const,
  },
  {
    target: '[data-tour="stats"]',
    title: 'Your Stats Dashboard',
    content: 'View your weekly progress, completed habits today, and your best streak. Keep it up!',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="achievements"]',
    title: 'Achievements',
    content: 'Complete habits to unlock achievements! Earn badges for streaks and consistency.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="settings"]',
    title: 'Customize Your Experience',
    content: 'Open settings to toggle dark mode, enable notifications, and manage your data.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="calendar"]',
    title: 'View Calendar',
    content: 'Switch to calendar view to see your habit history in a monthly calendar format.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="analytics"]',
    title: 'Analytics Dashboard',
    content: 'View detailed analytics including your total time, streaks, heatmaps, and habit rankings.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="quote"]',
    title: 'Daily Motivation',
    content: 'Get a personalized motivational message based on your progress today. Keep pushing forward!',
    position: 'top' as const,
    offset: 40,
  },
];

export function Tour() {
  const { uiState, setTourCompleted, setTourStep, startTour } = useHabitStore();
  const { hasSeenTour, tourCurrentStep } = uiState;
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tourStep = TOUR_STEPS[tourCurrentStep];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !hasSeenTour && tourCurrentStep < TOUR_STEPS.length) {
      const timeout = setTimeout(() => {
        let frame1 = requestAnimationFrame(() => {
          let frame2 = requestAnimationFrame(() => {
            setIsVisible(true);
            setTimeout(updateTargetPosition, 50);
          });
          return () => cancelAnimationFrame(frame2);
        });
        return () => {
          clearTimeout(timeout);
          cancelAnimationFrame(frame1);
        };
      }, 300);
    }
  }, [isMounted, hasSeenTour, tourCurrentStep]);

  useEffect(() => {
    if (isVisible && tourStep) {
      let frame1 = requestAnimationFrame(() => {
        let frame2 = requestAnimationFrame(() => {
          updateTargetPosition();
        });
        return () => cancelAnimationFrame(frame2);
      });
      return () => cancelAnimationFrame(frame1);
    }
  }, [isVisible, tourCurrentStep]);

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, true);
      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition, true);
      };
    }
  }, [isVisible]);

  const updateTargetPosition = () => {
    const target = document.querySelector(tourStep.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      calculateTooltipPosition(rect, tourStep.position, tourStep.offset);
    }
  };

  const calculateTooltipPosition = (targetRect: DOMRect, position: string, offset?: number) => {
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const gap = 16;
    const extraOffset = offset || 0;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipHeight - gap - extraOffset;
        left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        left = targetRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        left = targetRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    setTooltipPosition({ top, left });
  };

  const handleNext = () => {
    if (tourCurrentStep < TOUR_STEPS.length - 1) {
      setTourStep(tourCurrentStep + 1);
    } else {
      setIsVisible(false);
      setTourCompleted();
    }
  };

  const handlePrev = () => {
    if (tourCurrentStep > 0) {
      setTourStep(tourCurrentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTourCompleted();
  };

  const handleRestart = () => {
    startTour();
  };

  if (!isVisible || !tourStep) return null;

  return (
    <>
      {targetRect && (
        <div
          className="fixed z-[100]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        >
          <div className="absolute inset-0 border-2 border-[var(--primary)] rounded-lg" />
          <div
            className="absolute inset-0 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed z-[101] bg-[var(--card-bg)] rounded-xl shadow-2xl border border-[var(--card-border)] overflow-hidden"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 320,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)] bg-[var(--secondary)]">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {tourCurrentStep + 1} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="p-1 rounded hover:bg-[var(--card-border)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--muted)]" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            {tourStep.title}
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {tourStep.content}
          </p>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--card-border)] bg-[var(--secondary)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-[var(--muted)]"
          >
            Skip
          </Button>
          <div className="flex items-center space-x-2">
            {tourCurrentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="flex items-center space-x-1"
            >
              {tourCurrentStep === TOUR_STEPS.length - 1 ? (
                <span>Get Started</span>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export function TourButton() {
  const startTour = useHabitStore((state) => state.startTour);
  const toggleSettings = useHabitStore((state) => state.toggleSettings);

  const handleStartTour = () => {
    toggleSettings(false);
    startTour();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartTour}
      className="flex items-center space-x-2"
    >
      <Play className="w-4 h-4" />
      <span>Start Tour</span>
    </Button>
  );
}
