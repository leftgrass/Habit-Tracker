'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface PanelTourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface PanelTourProps {
  steps: PanelTourStep[];
  hasSeenTour: boolean;
  currentStep: number;
  setTourCompleted: () => void;
  setTourStep: (step: number) => void;
  startTour: () => void;
  onClose?: () => void;
}

export function PanelTour({
  steps,
  hasSeenTour,
  currentStep,
  setTourCompleted,
  setTourStep,
  startTour,
  onClose,
}: PanelTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const step = steps[currentStep];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !hasSeenTour && currentStep < steps.length) {
      setIsVisible(true);
    }
  }, [isMounted, hasSeenTour, currentStep, steps.length]);

  useEffect(() => {
    if (isVisible && step) {
      updateTargetPosition();
    }
  }, [isVisible, currentStep]);

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
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      calculateTooltipPosition(rect, step.position);
    }
  };

  const calculateTooltipPosition = (targetRect: DOMRect, position: string) => {
    const tooltipWidth = 300;
    const tooltipHeight = 180;
    const gap = 12;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipHeight - gap;
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

    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - tooltipHeight - 12));

    setTooltipPosition({ top, left });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setTourStep(currentStep + 1);
    } else {
      setIsVisible(false);
      setTourCompleted();
      onClose?.();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setTourStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTourCompleted();
    onClose?.();
  };

  if (!isVisible || !step) return null;

  return (
    <>
      {targetRect && (
        <div
          className="absolute z-[100]"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
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
        className="absolute z-[101] bg-[var(--card-bg)] rounded-xl shadow-2xl border border-[var(--card-border)] overflow-hidden"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 300,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)] bg-[var(--secondary)]">
          <span className="text-sm font-medium text-[var(--foreground)]">
            {currentStep + 1} of {steps.length}
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
            {step.title}
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            {step.content}
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
            {currentStep > 0 && (
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
              {currentStep === steps.length - 1 ? (
                <span>Got it</span>
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
