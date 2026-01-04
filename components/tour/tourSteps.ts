import { PanelTourStep } from './PanelTour';

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
