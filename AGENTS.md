# AGENTS.md - Coding Guidelines for Habit Tracker

This file provides guidelines for AI coding agents working on this codebase.

## Build & Development Commands

```bash
# Start development server
npm run dev

# Production build (always run before committing)
npm run build

# Start production server (after build)
npm run start

# Lint codebase
npm run lint

# Run linter on specific files/directories
npx eslint "components/**/*.{ts,tsx}"
npx eslint "app/**/*.{ts,tsx}"
```

## Project Structure

```
habit-tracker/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles + CSS variables
├── components/
│   ├── habits/            # Habit-related components (WeeklyGrid, HabitModal, etc.)
│   ├── ui/                # Reusable UI components (Button, Card, etc.)
│   ├── analytics/         # Analytics panel
│   ├── calendar/          # Calendar panel
│   ├── settings/          # Settings panel
│   └── tour/              # Guided tour components
├── hooks/                 # Custom React hooks (useConfetti, etc.)
├── store/                 # Zustand state management (useHabitStore)
├── types/                 # TypeScript type definitions
└── lib/                   # Utility functions (cn for tailwind-merge)
```

## Code Style Guidelines

### Imports

- Use absolute imports with `@/` prefix (e.g., `import { useHabitStore } from '@/store/useHabitStore'`)
- Group imports in this order:
  1. React core imports
  2. Third-party libraries (framer-motion, lucide-react, etc.)
  3. Absolute imports from `@/`
  4. Relative imports (./components, ./hooks, etc.)
- Separate import groups with blank lines

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
```

### React Components

- Client components must include `'use client'` at the top
- Use function components, not class components
- Use named exports for components
- Component file naming: `PascalCase.tsx`
- Keep components focused and under 200 lines when possible
- Extract complex logic into custom hooks

```typescript
export function HabitModal() {
  // Component logic
  return (
    <div>...</div>
  );
}
```

### TypeScript Types

- Use explicit types for props, state, and function parameters
- Define interfaces for complex objects in `types/index.ts`
- Use TypeScript enums for fixed sets of related values
- Avoid `any` type - use `unknown` or more specific types

```typescript
interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  color: string;
  completions: Record<string, number>;
  currentStreak: number;
  // ...
}

type HabitCategory = 'health' | 'productivity' | 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creative' | 'work' | 'personal' | 'other';
```

### State Management (Zustand)

- Use Zustand for global state (see `store/useHabitStore.ts`)
- Define interface for store state with all actions
- Use persist middleware for data that needs to survive page reloads
- State updates should be immutable

```typescript
interface HabitState {
  habits: Habit[];
  uiState: UIState;
  addHabit: (data: HabitFormData) => void;
  toggleHabitCompletion: (habitId: string, date: string, minutes?: number) => void;
  // ...
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (data) => {
        set((state) => ({
          habits: [...state.habits, newHabit],
        }));
      },
      // ...
    }),
    { name: 'habit-tracker-storage' }
  )
);
```

### CSS & Styling

- Use Tailwind CSS for all styling
- Use CSS variables from `:root` for colors (see `app/globals.css`)
- Never use hardcoded colors - use `var(--primary)`, `var(--success)`, etc.
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow responsive design pattern: `className="text-sm md:text-base"`

```typescript
<div className={cn(
  "p-4 rounded-lg transition-all duration-300",
  isActive && "bg-[var(--primary)] text-white",
  isAnyTimerRunning && "dimmed-element"
)} />
```

### Error Handling

- Never use empty catch blocks: `catch(e) {}`
- Use try/catch for async operations
- Return meaningful error states from functions
- Log errors appropriately for debugging

### Naming Conventions

- **Components**: PascalCase (`HabitModal`, `WeeklyGrid`)
- **Hooks**: camelCase with "use" prefix (`useConfetti`, `useNotifications`)
- **Variables & Functions**: camelCase (`activeHabits`, `toggleHabitModal`)
- **Constants**: SCREAMING_SNAKE_CASE or camelCase for simple constants
- **CSS Classes**: kebab-case (via Tailwind)

### File Organization

- One component per file (except closely related small components)
- Keep related files in same directory
- Use index.ts for re-exports when module has multiple exports

### Responsive Design

- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach - base styles for mobile, `md:` for desktop
- Test on both mobile and desktop before committing
- See `components/MobileNav.tsx` for mobile-specific patterns

### Testing

- No test framework currently configured
- When adding tests, place them alongside components with `.test.tsx` extension
- Run `npm run build` to verify changes don't break production build

## Commit Guidelines

- Run `npm run build` before committing to ensure no build errors
- Write clear commit messages describing the change
- Use conventional commits format: `feat:`, `fix:`, `docs:`, `refactor:`

## Key Dependencies

- **Framework**: Next.js 16 with App Router
- **State**: Zustand with persist middleware
- **Styling**: Tailwind CSS v4 with CSS variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Confetti**: canvas-confetti
