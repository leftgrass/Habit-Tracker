'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore } from '@/store/useHabitStore';
import { CircularProgress } from '@/components/ui/ProgressBar';
import { MobileWeeklyView } from './MobileWeeklyView';
import { MobileLayout } from './MobileLayout';

export function MobileHome() {
  const { habits } = useHabitStore();
  
  const activeHabits = habits.filter(h => !h.isArchived);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const completedToday = activeHabits.filter(h => (h.completions[todayStr] || 0) >= h.targetMinutes).length;
  const progress = activeHabits.length > 0 ? (completedToday / activeHabits.length) * 100 : 0;

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greetingEmoji = hour < 12 ? '🌅' : hour < 18 ? '☀️' : '🌙';
  const greetingText = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <MobileLayout>
      <div className="mobile-header">
        <div className="header-row">
          <div className="logo">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="greeting-section">
            <span className="greeting-emoji">{greetingEmoji}</span>
            <div className="greeting-text">
              <span className="greeting-main">{greetingText}</span>
              <span className="greeting-date">{format(new Date(), 'EEEE, MMMM d')}</span>
            </div>
          </div>
          <div className="progress-section">
            <CircularProgress progress={progress} size={28} strokeWidth={3} color="var(--primary)" showLabel={false} />
            <div className="progress-text">
              <span className="progress-num">{completedToday}/{activeHabits.length}</span>
              <span className="progress-label">done</span>
            </div>
          </div>
        </div>

        <MobileWeeklyView />
      </div>

      <style jsx>{`
        .mobile-header { max-width: 420px; margin: 0 auto; }
        
        .header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--logo-gradient-from), var(--logo-gradient-to));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(122, 162, 247, 0.3);
          flex-shrink: 0;
        }
        
        .greeting-section {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
          padding-left: 20px;
        }
        
        .greeting-emoji {
          font-size: 24px;
        }
        
        .greeting-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .greeting-main {
          font-size: 15px;
          font-weight: 600;
          color: var(--foreground);
        }
        
        .greeting-date {
          font-size: 12px;
          color: var(--muted);
        }
        
        .progress-section {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--card-bg);
          padding: 6px 10px 6px 6px;
          border-radius: 12px;
          border: 1px solid var(--card-border);
          flex-shrink: 0;
          height: 40px;
        }
        
        .progress-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .progress-num {
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1;
        }
        
        .progress-label {
          font-size: 9px;
          color: var(--muted);
        }
      `}</style>
    </MobileLayout>
  );
}
