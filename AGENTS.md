# AGENTS.md - Coding Guidelines for Habit Tracker

This file provides guidelines for AI coding agents working on this codebase.

## Build & Development Commands

```bash
# Start development server
npm run dev

# Production build (ALWAYS run before committing)
npm run build

# Start production server (after build)
npm run start

# Lint codebase
npm run lint

# Lint specific files/directories
npx eslint "components/**/*.{ts,tsx}"
npx eslint "app/**/*.{ts,tsx}"
```

## Project Structure

```
habit-tracker/
├── app/              # Next.js App Router pages (layout.tsx, page.tsx)
├── components/
│   ├── habits/       # WeeklyGrid, HabitModal, TimeTracker, FocusedTimer
│   ├── ui/           # Button, Card, ProgressBar, ClientOnly
│   ├── analytics/    # AnalyticsPanel - stats, heatmaps, rankings
│   ├── calendar/     # CalendarPanel - monthly calendar view
│   ├── settings/     # SettingsPanel - theme, notifications, data
│   ├── tour/         # Tour, TourButton - guided tour
│   └── providers/    # ThemeProvider - dark/light mode
├── hooks/            # useConfetti, useSound, useNotifications, useTimer
├── store/            # Zustand state management (useHabitStore.ts)
├── types/            # TypeScript type definitions
└── lib/              # Utilities (cn, formatTime, debounce)
```

## Code Style Guidelines

### Imports

Order imports strictly by category, blank line between groups:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useConfetti } from '@/hooks/useConfetti';
```

### React Components

- **Client components**: `'use client'` at top, before imports
- **File naming**: `PascalCase.tsx` for components, `camelCase.ts` for hooks
- **Props**: Define interface with explicit types

```typescript
interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
}

export function HabitCard({ habit }: HabitCardProps) { /* ... */ }
```

### TypeScript Types

- **No `any`**: Use `unknown` or specific types
- **Complex types**: Define in `types/index.ts`
- **Interfaces over types**: For extensibility

### State Management (Zustand)

All state in `store/useHabitStore.ts`. Always use immutable updates:

```typescript
addHabit: (data) => set((state) => ({
  habits: [...state.habits, newHabit],
})),
deleteHabit: (id) => set((state) => ({
  habits: state.habits.filter((h) => h.id !== id),
})),
```

### CSS & Styling

- **Tailwind CSS v4** with CSS variables (`var(--primary)`, `var(--success)`, etc.)
- **Always use `cn()`** for conditional classes
- **Mobile-first**: Base styles, then `md:`/`lg:` breakpoints
- **Animations**: Framer Motion `motion.*` components

```typescript
<div className={cn(
  "p-4 rounded-xl transition-all duration-200",
  isActive && "bg-[var(--primary)] text-white"
)} />
```

### Error Handling

- **Never empty catch blocks**: `catch(e) {}` is forbidden
- **Always handle async errors**: try/catch with meaningful error states

### Naming Conventions

| Item | Convention | Examples |
|------|------------|----------|
| Components | PascalCase | `WeeklyGrid`, `HabitModal` |
| Hooks | use prefix | `useConfetti`, `useTimer` |
| Variables/Functions | camelCase | `isCompleted`, `toggleModal` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_NAME_LENGTH` |
| Types | PascalCase | `Habit`, `HabitCategory` |
| CSS Variables | kebab-case | `--primary`, `--card-border` |

### Formatting

- Semicolons, single quotes, trailing commas
- ~100 char line limit
- Blank lines between import groups and major code blocks

### Git Commits

- Run `npm run build` before committing (required)
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `style:`

## Key Workflows

### First-Time Visitor
1. `WelcomeOverlay` checks `localStorage.hasSeenWelcomeOverlay`
2. First visit: shows welcome → click "Start Tour Guide" → calls `startTour()`
3. Tour uses `data-tour` attributes on elements for targeting

### Celebrations
- **Confetti**: Triggers via `useConfetti.ts` on habit completion
- **Sounds**: Web Audio API via `useSound.ts` with confetti
- **Achievements**: `AchievementConfetti.ts` celebrates unlocks

## Important Files

| File | Purpose |
|------|---------|
| `store/useHabitStore.ts` | All global state, habits, achievements, UI, timer |
| `hooks/useConfetti.ts` | Confetti triggers + sound playback |
| `hooks/useTimer.ts` | Per-habit/per-date timer state |
| `components/habits/WeeklyGrid.tsx` | Main habit tracking UI |
| `components/tour/Tour.tsx` | 8-step guided tour with tooltip positioning |
| `app/globals.css` | CSS variables, dark mode overrides |
