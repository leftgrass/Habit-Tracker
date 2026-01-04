import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Habit, HabitFormData, Schedule, Achievement, UIState, RunningTimer } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface HabitState {
  habits: Habit[];
  schedules: Schedule[];
  achievements: Achievement[];
  uiState: UIState;
  activeTimer: RunningTimer | null;
  addHabit: (data: HabitFormData) => void;
  updateHabit: (id: string, data: Partial<HabitFormData>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string, minutes?: number) => void;
  archiveHabit: (id: string) => void;
  moveHabitUp: (id: string) => void;
  moveHabitDown: (id: string) => void;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  unlockAchievement: (id: string) => void;
  updateAchievementProgress: (id: string, progress: number) => void;
  setViewMode: (mode: 'week' | 'month' | 'analytics') => void;
  toggleHabitModal: (open: boolean, habitId?: string) => void;
  toggleSettings: (open?: boolean) => void;
  toggleAnalytics: (open?: boolean) => void;
  toggleCalendar: (open?: boolean) => void;
  setFocusedTimer: (habitId: string | null, date: string | null) => void;
  setFloatingTimer: (habitId: string | null, date: string | null) => void;
  setFloatingTimerPosition: (position: { x: number; y: number }) => void;
  setSelectedDate: (date: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotifications: (settings: { enabled?: boolean; reminderTime?: string; streakAlertsEnabled?: boolean }) => void;
  setTourCompleted: () => void;
  setTourStep: (step: number) => void;
  startTour: () => void;
  startTimer: (habitId: string, date: string) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimerAccumulatedTime: (minutes: number) => void;
  getElapsedMinutes: () => number;
  getElapsedSeconds: () => number;
  isTimerRunning: (habitId: string, date: string) => boolean;
  getCurrentTimer: () => RunningTimer | null;
  updateTimerProgress: (minutes: number) => void;
  getWeeklyStats: () => { totalHabits: number; completedToday: number; completionRate: number; weeklyCompletionRate: number; currentStreak: number };
  getHabitStreak: (habitId: string) => number;
  getWeeklyProgress: () => { date: string; completed: number; total: number }[];
  calculateStreakForDate: (habitId: string, date: string) => number;
}

const HABIT_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-habit', name: 'Getting Started', description: 'Create your first habit', icon: '🚀', progress: 0, target: 1, category: 'milestone' },
  { id: 'first-completion', name: 'First Step', description: 'Complete your first habit', icon: '✨', progress: 0, target: 1, category: 'milestone' },
  { id: '3-day-streak', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥', progress: 0, target: 3, category: 'streak' },
  { id: '7-day-streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '💪', progress: 0, target: 7, category: 'streak' },
  { id: '30-day-streak', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '🏆', progress: 0, target: 30, category: 'streak' },
  { id: '5-habits', name: 'Diversified', description: 'Have 5 active habits', icon: '🌈', progress: 0, target: 5, category: 'milestone' },
  { id: 'all-complete', name: 'Perfect Day', description: 'Complete all habits in a day', icon: '🎯', progress: 0, target: 1, category: 'completion' },
  { id: 'week-perfect', name: 'Week Master', description: 'Complete all habits for a whole week', icon: '⭐', progress: 0, target: 7, category: 'consistency' },
];

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      schedules: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      uiState: {
        isHabitModalOpen: false,
        isSettingsOpen: false,
        isAnalyticsOpen: false,
        isCalendarOpen: false,
        selectedHabitId: null,
        selectedDate: format(new Date(), 'yyyy-MM-dd'),
        viewMode: 'week',
        sidebarCollapsed: false,
        theme: 'light',
        focusedTimer: { habitId: null, date: null },
        floatingTimer: { habitId: null, date: null },
        floatingTimerPosition: { x: 20, y: 20 },
        notifications: {
          enabled: false,
          reminderTime: '09:00',
          streakAlertsEnabled: true,
        },
        hasSeenTour: false,
        tourCurrentStep: 0,
      },
      activeTimer: null,

      addHabit: (data) => {
    const newHabit: Habit = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      category: data.category,
      color: data.color || HABIT_COLORS[get().habits.length % HABIT_COLORS.length],
      icon: data.icon,
      frequency: data.frequency,
      scheduleDays: data.scheduleDays,
      targetMinutes: data.targetMinutes || 30, // Default 30 minutes
      completions: {},
      currentStreak: 0,
      longestStreak: 0,
      totalMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };

    set((state) => ({
      habits: [...state.habits, newHabit],
    }));

    get().updateAchievementProgress('first-habit', get().habits.length);
    get().updateAchievementProgress('5-habits', get().habits.length);
  },

      updateHabit: (id, data) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...data, updatedAt: new Date().toISOString() } : habit
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
          schedules: state.schedules.filter((schedule) => schedule.habitId !== id),
        }));
      },

  toggleHabitCompletion: (habitId: string, date: string, minutes?: number) => {
    let updatedHabit: Habit | null = null;
    
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id !== habitId) return habit;

        const currentMinutes = habit.completions[date] || 0;
        // If minutes not provided, toggle between 0 and target
        const newMinutes = minutes !== undefined 
          ? minutes 
          : currentMinutes > 0 
            ? 0 
            : habit.targetMinutes;

        // Calculate streak based on meeting/exceeding target
        let newStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        // Get all completions and sort by date
        const allDates = Object.keys(habit.completions).sort();
        
        if (newMinutes >= habit.targetMinutes) {
          // When completing: count from the date going backwards
          const dateIndex = allDates.findIndex(d => d === date);
          if (dateIndex !== -1) {
            for (let i = dateIndex; i >= 0; i--) {
              const d = allDates[i];
              if (habit.completions[d] >= habit.targetMinutes) {
                newStreak++;
              } else {
                break;
              }
            }
          }
        } else {
          // When not completing: count from yesterday going backwards
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (checkDate.getTime() === today.getTime()) {
            newStreak = 0;
          } else {
            const allDatesSet = new Set(allDates);
            const countDate = new Date(yesterday);
            while (true) {
              const dateStr = format(countDate, 'yyyy-MM-dd');
              if (allDatesSet.has(dateStr) && habit.completions[dateStr] >= habit.targetMinutes) {
                newStreak++;
                countDate.setDate(countDate.getDate() - 1);
              } else {
                break;
              }
            }
          }
        }

        const newCompletions = {
          ...habit.completions,
          [date]: newMinutes,
        };

        // Calculate total minutes
        const totalMinutes = Object.values(newCompletions).reduce((sum, m) => sum + m, 0);

        const habitUpdate: Habit = {
          ...habit,
          completions: newCompletions,
          currentStreak: newStreak,
          longestStreak: Math.max(habit.longestStreak, newStreak),
          totalMinutes,
          updatedAt: new Date().toISOString(),
        };

        updatedHabit = habitUpdate;
        return habitUpdate;
      }),
    }));

    // Access updated habit data after set
    const habit = get().habits.find(h => h.id === habitId);
    if (habit) {
      const completedDays = Object.values(habit.completions).filter(m => m >= habit.targetMinutes).length;
      get().updateAchievementProgress('first-completion', completedDays > 0 ? 1 : 0);
      
      const streak = habit.currentStreak;
      get().updateAchievementProgress('3-day-streak', streak);
      get().updateAchievementProgress('7-day-streak', streak);
      get().updateAchievementProgress('30-day-streak', streak);
      
      const todayStats = get().getWeeklyStats();
      if (todayStats.completedToday === todayStats.totalHabits && todayStats.totalHabits > 0) {
        get().updateAchievementProgress('all-complete', 1);
      }
    }
  },

      archiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, isArchived: true } : habit
          ),
        }));
      },

      moveHabitUp: (id) => {
        set((state) => {
          const habits = [...state.habits];
          const index = habits.findIndex(h => h.id === id);
          if (index > 0) {
            [habits[index - 1], habits[index]] = [habits[index], habits[index - 1]];
          }
          return { habits };
        });
      },

      moveHabitDown: (id) => {
        set((state) => {
          const habits = [...state.habits];
          const index = habits.findIndex(h => h.id === id);
          if (index < habits.length - 1) {
            [habits[index], habits[index + 1]] = [habits[index + 1], habits[index]];
          }
          return { habits };
        });
      },

      addSchedule: (schedule) => {
        const newSchedule: Schedule = {
          ...schedule,
          id: uuidv4(),
        };

        set((state) => ({
          schedules: [...state.schedules, newSchedule],
        }));
      },

      updateSchedule: (id, data) => {
        set((state) => ({
          schedules: state.schedules.map((schedule) =>
            schedule.id === id ? { ...schedule, ...data } : schedule
          ),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((schedule) => schedule.id !== id),
        }));
      },

      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map((achievement) =>
            achievement.id === id
              ? { ...achievement, unlockedAt: new Date().toISOString(), progress: achievement.target }
              : achievement
          ),
        }));
      },

      updateAchievementProgress: (id, progress) => {
        set((state) => ({
          achievements: state.achievements.map((achievement) =>
            achievement.id === id
              ? { ...achievement, progress: Math.min(progress, achievement.target) }
              : achievement
          ),
        }));
      },

      setViewMode: (mode) => {
        set((state) => ({
          uiState: { ...state.uiState, viewMode: mode },
        }));
      },

      toggleHabitModal: (open, habitId) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isHabitModalOpen: open,
            selectedHabitId: habitId || null,
          },
        }));
      },

      toggleSettings: (open) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isSettingsOpen: open !== undefined ? open : !state.uiState.isSettingsOpen,
          },
        }));
      },

      toggleAnalytics: (open) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isAnalyticsOpen: open !== undefined ? open : !state.uiState.isAnalyticsOpen,
          },
        }));
      },

      toggleCalendar: (open) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isCalendarOpen: open !== undefined ? open : !state.uiState.isCalendarOpen,
          },
        }));
      },

      setFocusedTimer: (habitId, date) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            focusedTimer: { habitId, date },
          },
        }));
      },

      setFloatingTimer: (habitId, date) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            floatingTimer: { habitId, date },
          },
        }));
      },

      setFloatingTimerPosition: (position) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            floatingTimerPosition: position,
          },
        }));
      },

      setSelectedDate: (date) => {
        set((state) => ({
          uiState: { ...state.uiState, selectedDate: date },
        }));
      },

      toggleSidebar: () => {
        set((state) => ({
          uiState: { ...state.uiState, sidebarCollapsed: !state.uiState.sidebarCollapsed },
        }));
      },

      setTheme: (theme) => {
        set((state) => ({
          uiState: { ...state.uiState, theme },
        }));
      },

      setNotifications: (settings) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            notifications: { ...state.uiState.notifications, ...settings },
          },
        }));
      },

      setTourCompleted: () => {
        set((state) => ({
          uiState: { ...state.uiState, hasSeenTour: true },
        }));
      },

      setTourStep: (step) => {
        set((state) => ({
          uiState: { ...state.uiState, tourCurrentStep: step },
        }));
      },

      startTour: () => {
        set((state) => ({
          uiState: { ...state.uiState, hasSeenTour: false, tourCurrentStep: 0 },
        }));
      },

      getHabitStreak: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        return habit?.currentStreak || 0;
      },

      calculateStreakForDate: (habitId, date) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return 0;

        let streak = 0;
        const checkDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate > today) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          if (habit.completions[dateStr] >= habit.targetMinutes) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return streak;
      },

      getWeeklyStats: () => {
        const { habits, uiState } = get();
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const todayDayName = format(today, 'EEE');
        const activeHabits = habits.filter(h => !h.isArchived);

        // Filter to only habits scheduled for today (for daily stat)
        const habitsScheduledToday = activeHabits.filter(habit => {
          if (habit.frequency === 'daily') return true;
          return habit.scheduleDays.includes(todayDayName);
        });

        // A habit is "completed today" if minutes >= target
        const completedToday = habitsScheduledToday.filter(h => (h.completions[todayStr] || 0) >= h.targetMinutes).length;
        const totalHabitsScheduledToday = habitsScheduledToday.length;
        const completionRate = totalHabitsScheduledToday > 0 ? (completedToday / totalHabitsScheduledToday) * 100 : 0;

        // Calculate total weekly completion rate
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
        const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

        let weeklyCompleted = 0;
        let weeklyTotal = 0;

        weekDays.forEach(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayName = format(day, 'EEE');

          const habitsScheduledThisDay = activeHabits.filter(habit => {
            if (habit.frequency === 'daily') return true;
            return habit.scheduleDays.includes(dayName);
          });

          weeklyTotal += habitsScheduledThisDay.length;
          weeklyCompleted += habitsScheduledThisDay.filter(h => (h.completions[dateStr] || 0) >= h.targetMinutes).length;
        });

        const weeklyCompletionRate = weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0;

        const currentStreak = activeHabits.reduce((max, habit) => Math.max(max, habit.currentStreak), 0);

        return {
          totalHabits: totalHabitsScheduledToday,
          completedToday,
          completionRate,
          weeklyCompletionRate,
          currentStreak,
        };
      },

      getWeeklyProgress: () => {
        const { habits, uiState } = get();
        const today = new Date();
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
        const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

        const activeHabits = habits.filter(h => !h.isArchived);

        return weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayName = format(day, 'EEE');
          
          // Filter to only habits scheduled for this day
          const habitsScheduledThisDay = activeHabits.filter(habit => {
            if (habit.frequency === 'daily') return true;
            return habit.scheduleDays.includes(dayName);
          });

          const completed = habitsScheduledThisDay.filter(h => (h.completions[dateStr] || 0) >= h.targetMinutes).length;
          return {
            date: dateStr,
            completed,
            total: habitsScheduledThisDay.length,
          };
        });
      },

      startTimer: (habitId: string, date: string) => {
        const { activeTimer } = get();

        if (activeTimer && activeTimer.isRunning) {
          const elapsed = get().getElapsedMinutes();
          get().updateTimerProgress(elapsed);
        }

        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return;

        let newAccumulatedTime = habit.completions[date] || 0;

        if (activeTimer && !activeTimer.isRunning && activeTimer.habitId === habitId && activeTimer.date === date) {
          newAccumulatedTime = activeTimer.accumulatedTime;
        }

        set({
          activeTimer: {
            habitId,
            date,
            startTime: Date.now(),
            accumulatedTime: newAccumulatedTime,
            isRunning: true,
          },
        });
      },

      pauseTimer: () => {
        const { activeTimer } = get();
        if (!activeTimer) return;

        const elapsed = get().getElapsedMinutes();
        get().updateTimerProgress(elapsed);

        set((state) => ({
          activeTimer: state.activeTimer
            ? {
                ...state.activeTimer,
                accumulatedTime: elapsed,
                isRunning: false,
              }
            : null,
        }));
      },

      setTimerAccumulatedTime: (minutes: number) => {
        set((state) => ({
          activeTimer: state.activeTimer
            ? {
                ...state.activeTimer,
                accumulatedTime: minutes,
              }
            : null,
        }));
      },

      resetTimer: () => {
        const { activeTimer } = get();
        if (!activeTimer) return;
        
        set({
          activeTimer: {
            ...activeTimer,
            accumulatedTime: 0,
            isRunning: false,
          },
        });
      },

      getElapsedMinutes: () => {
        const { activeTimer } = get();
        if (!activeTimer) return 0;

        if (!activeTimer.isRunning) {
          return activeTimer.accumulatedTime;
        }

        const now = Date.now();
        const elapsedMs = now - activeTimer.startTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const elapsedMinutes = elapsedSeconds / 60;

        return activeTimer.accumulatedTime + elapsedMinutes;
      },

      getElapsedSeconds: () => {
        const { activeTimer } = get();
        if (!activeTimer) return 0;

        const now = Date.now();
        const elapsedMs = now - activeTimer.startTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        return activeTimer.accumulatedTime * 60 + elapsedSeconds;
      },

      isTimerRunning: (habitId: string, date: string) => {
        const { activeTimer } = get();
        return activeTimer?.habitId === habitId &&
               activeTimer?.date === date &&
               activeTimer?.isRunning;
      },

      getCurrentTimer: () => {
        return get().activeTimer;
      },

      updateTimerProgress: (minutes: number) => {
        const { activeTimer } = get();
        if (!activeTimer) return;

        const habit = get().habits.find(h => h.id === activeTimer.habitId);
        if (!habit) return;

        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === activeTimer.habitId
              ? {
                  ...h,
                  completions: { ...h.completions, [activeTimer.date]: minutes },
                  totalMinutes: Object.entries({
                    ...h.completions,
                    [activeTimer.date]: minutes,
                  }).reduce((sum, [, m]) => sum + m, 0),
                  updatedAt: new Date().toISOString(),
                }
              : h
          ),
        }));
      },
    }),
    {
      name: 'habit-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.uiState.floatingTimer) {
            state.uiState.floatingTimer = { habitId: null, date: null };
          }
          if (!state.uiState.floatingTimerPosition) {
            state.uiState.floatingTimerPosition = { x: 20, y: 20 };
          }
          if (!state.uiState.notifications) {
            state.uiState.notifications = {
              enabled: false,
              reminderTime: '09:00',
              streakAlertsEnabled: true,
            };
          }
          if (state.uiState.hasSeenTour === undefined) {
            state.uiState.hasSeenTour = false;
          }
          if (state.uiState.tourCurrentStep === undefined) {
            state.uiState.tourCurrentStep = 0;
          }
        }
      },
    }
  )
);
