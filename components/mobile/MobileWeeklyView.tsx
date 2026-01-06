'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Flame, Trophy, ArrowUp, ArrowDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { useConfetti } from '@/hooks/useConfetti';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, isBefore, startOfDay } from 'date-fns';
import { TimeTracker } from '@/components/habits/TimeTracker';

export function MobileWeeklyView() {
  const store = useHabitStore();
  const activeHabits = useMemo(() => store.habits.filter(h => !h.isArchived), [store.habits]);
  const { triggerConfetti, resetTrigger } = useConfetti();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    return start;
  });
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  const weekDates = useMemo(() => {
    const start = startOfWeek(currentWeekStart, { weekStartsOn: 0 });
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStart]);

  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    setCurrentWeekStart(start);
    setSelectedDate(startOfDay(today));
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedDateFuture = isBefore(startOfDay(new Date()), selectedDate);

  const habitsForSelectedDate = useMemo(() => {
    const selectedDayName = format(selectedDate, 'EEE');
    return activeHabits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      return habit.scheduleDays.includes(selectedDayName);
    });
  }, [activeHabits, selectedDate]);

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <div className="week-nav">
        <button onClick={goToPreviousWeek} className="week-nav-btn">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={goToToday} className="week-label">
          {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'd')}
        </button>
        <button onClick={goToNextWeek} className="week-nav-btn">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="day-selector">
        {weekDates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = isSameDay(date, selectedDate);
          const isDateToday = isToday(date);
          const dayProgress = activeHabits.length > 0 ? (activeHabits.filter(h => (h.completions[dateStr] || 0) >= h.targetMinutes).length / activeHabits.length) * 100 : 0;

          return (
            <button key={dateStr} onClick={() => setSelectedDate(startOfDay(date))} className={`day-btn ${isSelected ? 'selected' : ''} ${isDateToday && !isSelected ? 'today' : ''}`}>
              <span className="day-name">{format(date, 'EEE')}</span>
              <span className="day-num">{format(date, 'd')}</span>
              {dayProgress === 100 && <span className="day-check">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="current-date">
        <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
        <span>{format(selectedDate, 'EEEE, MMM d')}</span>
        {isSelectedDateFuture && <span className="future-badge">Future</span>}
      </div>

      <div className="habits-list">
        {habitsForSelectedDate.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '24px' }}>🌱</span>
            <p>{activeHabits.length > 0 ? 'No habits today' : 'Add your first habit!'}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {habitsForSelectedDate.map((habit, index) => {
              const wasCompleted = (habit.completions[selectedDateStr] || 0) >= habit.targetMinutes;
              const handleTimeChange = (mins: number) => {
                store.toggleHabitCompletion(habit.id, selectedDateStr, mins);
                
                if (mins >= habit.targetMinutes && !wasCompleted) {
                  triggerConfetti(habit.id, selectedDateStr);
                } else if (mins < habit.targetMinutes && wasCompleted) {
                  resetTrigger(habit.id, selectedDateStr);
                }
              };
              
              return (
                <MobileHabitCard 
                  key={habit.id} 
                  habit={habit} 
                  selectedDateStr={selectedDateStr} 
                  activeTimer={store.activeTimer} 
                  onTimeChange={handleTimeChange} 
                  onMoveUp={() => store.moveHabitUp(habit.id)} 
                  onMoveDown={() => store.moveHabitDown(habit.id)} 
                  isFirst={index === 0} 
                  isLast={index === habitsForSelectedDate.length - 1} 
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <style>{`
        .week-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .week-nav-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--secondary);
          border: none;
          cursor: pointer;
        }
        .week-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--foreground);
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          cursor: pointer;
        }
        .day-selector {
          display: flex;
          justify-content: space-between;
          gap: 4px;
          margin-bottom: 12px;
          padding: 6px;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--card-border);
        }
        .day-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 4px;
          border-radius: 8px;
          transition: all 0.15s;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .day-btn.selected {
          background: var(--primary);
        }
        .day-btn.today:not(.selected) {
          background: var(--secondary);
          border: 1px solid var(--success);
        }
        .day-name {
          font-size: 9px;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 500;
        }
        .day-btn.selected .day-name {
          color: rgba(255,255,255,0.8);
        }
        .day-num {
          font-size: 13px;
          font-weight: 600;
          color: var(--foreground);
          margin-top: 2px;
        }
        .day-btn.selected .day-num {
          color: white;
        }
        .day-check {
          font-size: 9px;
          color: white;
          margin-top: 2px;
        }
        .current-date {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--foreground);
        }
        .future-badge {
          font-size: 10px;
          padding: 2px 8px;
          background: var(--secondary);
          border-radius: 10px;
          color: var(--muted);
        }
        .habits-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .empty-state {
          text-align: center;
          padding: 32px 16px;
        }
        .empty-state p {
          color: var(--muted);
          font-size: 14px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}

interface MobileHabitCardProps {
  habit: any;
  selectedDateStr: string;
  activeTimer: any;
  onTimeChange: (mins: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function MobileHabitCard({ habit, selectedDateStr, activeTimer, onTimeChange, onMoveUp, onMoveDown, isFirst, isLast }: MobileHabitCardProps) {
  const minutesSpent = habit.completions[selectedDateStr] || 0;
  const isCompleted = minutesSpent >= habit.targetMinutes;
  const streak = habit.currentStreak;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggleHabitModal, deleteHabit } = useHabitStore();

  const handleEdit = () => {
    toggleHabitModal(true, habit.id);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this habit?')) {
      deleteHabit(habit.id);
    }
    setMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01 }}
      className={`habit-card ${isCompleted ? 'completed-card' : ''} ${activeTimer?.habitId === habit.id && activeTimer?.date === selectedDateStr ? 'timer-active' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
        <span style={{ fontSize: '20px', color: habit.color, flexShrink: 0 }}>●</span>
        <span className="habit-name">{habit.name}</span>
        {streak > 0 && <span className="streak-badge"><Flame className="w-3.5 h-3.5" />{streak}</span>}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst} style={{ background: 'none', border: 'none', cursor: isFirst ? 'default' : 'pointer', padding: '4px', opacity: isFirst ? 0.3 : 1 }}>
            <ArrowUp className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast} style={{ background: 'none', border: 'none', cursor: isLast ? 'default' : 'pointer', padding: '4px', opacity: isLast ? 0.3 : 1 }}>
            <ArrowDown className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <MoreVertical className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="habit-menu"
              >
                <button onClick={handleEdit} className="menu-item">
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button onClick={handleDelete} className="menu-item delete">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {isCompleted && (
        <div className="completed-badge">
          <Trophy className="w-3 h-3" />
          <span>Goal Met!</span>
        </div>
      )}
      
      <div className="habit-timer">
        <TimeTracker currentMinutes={minutesSpent} targetMinutes={habit.targetMinutes} onChange={onTimeChange} habitId={habit.id} date={selectedDateStr} />
      </div>

      <style>{`
        .habit-card {
          background: var(--secondary);
          border-radius: 16px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }
        .completed-card {
          border: 2px solid rgba(158, 206, 106, 0.5);
        }
        .timer-active {
          box-shadow: 0 0 35px var(--timer-glow-active), 0 8px 32px rgba(0, 0, 0, 0.2);
          transform: scale(1.01);
        }
        .habit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .habit-name {
          font-size: 20px;
          font-weight: 700;
          color: var(--foreground);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.3px;
        }
        .streak-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          padding: 3px 8px;
          background: linear-gradient(135deg, #b8860b 0%, #e07015 50%, #a0201a 100%);
          border-radius: 12px;
          color: white;
          font-weight: 700;
          flex-shrink: 0;
        }
        .completed-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 11px;
          padding: 3px 10px;
          background: rgba(158, 206, 106, 0.2);
          color: var(--success);
          border-radius: 12px;
          font-weight: 500;
          margin: 8px auto 0;
          width: fit-content;
        }
        .habit-timer {
          margin-top: 4px;
        }
        .habit-timer .space-y-4 {
          gap: 8px !important;
        }
        .habit-timer .text-3xl {
          font-size: 1.5rem !important;
        }
        .habit-timer .h-3 {
          height: 6px !important;
        }
        .habit-menu {
          position: absolute;
          top: '100%';
          right: 0;
          margin-top: 4px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          overflow: hidden;
          z-index: 100;
          min-width: 100px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: var(--foreground);
          text-align: left;
        }
        .menu-item:hover {
          background: var(--secondary);
        }
        .menu-item.delete {
          color: var(--danger);
        }
        .menu-item.delete:hover {
          background: rgba(179, 45, 37, 0.1);
        }
      `}</style>
    </motion.div>
  );
}
