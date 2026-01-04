import { PanelTourStep } from './PanelTour';

export const CALENDAR_TOUR_STEPS: PanelTourStep[] = [
  {
    target: '[data-calendar-tour="header"]',
    title: 'Your Calendar',
    content: 'View your habit history in a monthly calendar. Click the arrows to navigate between months.',
    position: 'bottom' as const,
  },
  {
    target: '[data-calendar-tour="grid"]',
    title: 'Completion Heatmap',
    content: 'Each day shows your completion rate. Green = 100%, Yellow = 50-99%, Red = 1-49%. Today is highlighted with a ring.',
    position: 'top' as const,
  },
  {
    target: '[data-calendar-tour="legend"]',
    title: 'Legend',
    content: 'Use the legend to understand the color coding. The bar shows completion percentage for each day.',
    position: 'top' as const,
  },
  {
    target: '[data-calendar-tour="stats"]',
    title: 'Quick Stats',
    content: 'See your total active habits, perfect days (100% completion), and average completion rate at a glance.',
    position: 'top' as const,
  },
];

export const ANALYTICS_TOUR_STEPS: PanelTourStep[] = [
  {
    target: '[data-analytics-tour="header"]',
    title: 'Analytics Dashboard',
    content: 'Track your progress and gain insights into your habit-building journey.',
    position: 'bottom' as const,
  },
  {
    target: '[data-analytics-tour="stats"]',
    title: 'Key Metrics',
    content: 'View your total time invested, average streak across all habits, best performing habit, and active habits count.',
    position: 'bottom' as const,
  },
  {
    target: '[data-analytics-tour="heatmap"]',
    title: '30-Day Heatmap',
    content: 'See your consistency over the last 30 days. Darker green means more habits completed. Today is highlighted.',
    position: 'top' as const,
  },
  {
    target: '[data-analytics-tour="progress"]',
    title: 'Weekly Progress',
    content: 'Compare your completion rates across all habits. See which habits need more attention.',
    position: 'top' as const,
  },
  {
    target: '[data-analytics-tour="rankings"]',
    title: 'Habit Rankings',
    content: 'Habits are ranked by total time invested. See your top performers and their stats.',
    position: 'top' as const,
  },
];

export const HABIT_TOUR_STEPS: PanelTourStep[] = [
  {
    target: '[data-habit-tour="name"]',
    title: 'Name Your Habit',
    content: 'Give your habit a clear, specific name. Be specific - "Morning Exercise" is better than "Exercise".',
    position: 'bottom' as const,
  },
  {
    target: '[data-habit-tour="category"]',
    title: 'Choose a Category',
    content: 'Select a category to organize your habits. This helps with analytics and achievements.',
    position: 'bottom' as const,
  },
  {
    target: '[data-habit-tour="color"]',
    title: 'Pick a Color',
    content: 'Choose a color for this habit. It will be used throughout the app to identify this habit.',
    position: 'bottom' as const,
  },
  {
    target: '[data-habit-tour="frequency"]',
    title: 'Set Frequency',
    content: 'Choose Daily for habits you want to do every day, or Weekly to select specific days.',
    position: 'bottom' as const,
  },
  {
    target: '[data-habit-tour="target"]',
    title: 'Daily Target',
    content: 'Set your daily target time. You can track time spent on each habit. The goal is to meet or exceed this target.',
    position: 'top' as const,
  },
  {
    target: '[data-habit-tour="submit"]',
    title: 'Create Your Habit',
    content: 'Click "Create Habit" to save. You can always edit or delete habits later from the main screen.',
    position: 'top' as const,
  },
];
