// Core habit types
export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  color: string;
  icon?: string;
  frequency: HabitFrequency;
  scheduleDays: string[];
  // Time-based tracking
  targetMinutes: number; // Target minutes per day (e.g., 30 = 30 min, 120 = 2 hours)
  completions: Record<string, number>; // minutes spent per day (0 if not done)
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export type HabitCategory = 
  | 'health' | 'productivity' | 'fitness' | 'learning' 
  | 'mindfulness' | 'social' | 'creative' | 'work' 
  | 'personal' | 'other';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface HabitFormData {
  name: string;
  description?: string;
  category: HabitCategory;
  color: string;
  icon?: string;
  frequency: HabitFrequency;
  scheduleDays: string[];
  targetMinutes: number; // Default target minutes per day
}

// Schedule types
export interface Schedule {
  id: string;
  habitId: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isCompleted: boolean;
  notes?: string;
}

// Analytics types
export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  streakDays: number;
  bestHabit: string;
  mostProductiveDay: string;
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalCompletions: number;
  averageCompletionRate: number;
  bestStreak: number;
  habitBreakdown: HabitBreakdown[];
}

export interface HabitBreakdown {
  habitId: string;
  habitName: string;
  totalCompletions: number;
  completionRate: number;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
  category: 'streak' | 'completion' | 'consistency' | 'milestone';
}

// UI State types
export interface UIState {
  isHabitModalOpen: boolean;
  isSettingsOpen: boolean;
  isAnalyticsOpen: boolean;
  isCalendarOpen: boolean;
  selectedHabitId: string | null;
  selectedDate: string;
  viewMode: 'week' | 'month' | 'analytics';
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  focusedTimer: {
    habitId: string | null;
    date: string | null;
  };
  floatingTimer: {
    habitId: string | null;
    date: string | null;
  };
  floatingTimerPosition: {
    x: number;
    y: number;
  };
  notifications: {
    enabled: boolean;
    reminderTime: string;
    streakAlertsEnabled: boolean;
  };
}

// Calendar event types for FullCalendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color: string;
  extendedProps: {
    habitId: string;
    isCompleted: boolean;
  };
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Timer types
export interface RunningTimer {
  habitId: string;
  date: string;
  startTime: number;
  accumulatedTime: number;
  isRunning: boolean;
}

export interface TimerState {
  activeTimer: RunningTimer | null;
  lastTick: number;
}
