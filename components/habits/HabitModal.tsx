'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { HabitCategory, HabitFrequency } from '@/types';

const CATEGORIES = [
  { value: 'health', label: 'Health', emoji: '🏃' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'productivity', label: 'Productivity', emoji: '📈' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'personal', label: 'Personal', emoji: '🌱' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

const HABIT_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
const DAY_ABBREVS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function HabitModal() {
  const { uiState, toggleHabitModal, addHabit, updateHabit, deleteHabit } = useHabitStore();
  const { isHabitModalOpen, selectedHabitId } = uiState;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('other');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>(DAY_ABBREVS);
  const [targetHours, setTargetHours] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(30);

  const habits = useHabitStore((state) => state.habits);
  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  useEffect(() => {
    if (selectedHabit) {
      setName(selectedHabit.name);
      setDescription(selectedHabit.description || '');
      setCategory(selectedHabit.category as HabitCategory);
      setColor(selectedHabit.color);
      setFrequency(selectedHabit.frequency);
      setSelectedDays(selectedHabit.scheduleDays);
      const mins = selectedHabit.targetMinutes || 0;
      setTargetHours(Math.floor(mins / 60));
      setTargetMinutes(mins % 60);
    } else {
      setName('');
      setDescription('');
      setCategory('other');
      setColor(HABIT_COLORS[0]);
      setFrequency('daily');
      setSelectedDays(DAY_ABBREVS);
      setTargetHours(0);
      setTargetMinutes(30);
    }
  }, [selectedHabit, isHabitModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const scheduleDays = frequency === 'daily' ? DAY_ABBREVS : selectedDays;
    const safeHours = isNaN(targetHours) ? 0 : Math.max(0, targetHours);
    const safeMinutes = isNaN(targetMinutes) ? 0 : Math.max(0, targetMinutes);
    const totalTargetMinutes = safeHours * 60 + safeMinutes;
    const habitData = { 
      name: name.trim(), 
      description: description.trim() || undefined, 
      category, 
      color, 
      frequency, 
      scheduleDays,
      targetMinutes: totalTargetMinutes,
    };
    if (selectedHabitId && selectedHabit) { updateHabit(selectedHabitId, habitData); }
    else { addHabit(habitData); }
    toggleHabitModal(false);
  };

  const handleDelete = () => {
    if (selectedHabitId && confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(selectedHabitId);
      toggleHabitModal(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <AnimatePresence>
      {isHabitModalOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => toggleHabitModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-[var(--card-bg)] rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">{selectedHabitId ? 'Edit Habit' : 'Create New Habit'}</h2>
                <button onClick={() => toggleHabitModal(false)} className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--secondary)]"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name (e.g., Morning Exercise)" className="w-full px-4 py-3 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--muted)]" autoFocus />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-4 py-3 border border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--muted)] resize-none" />
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.value} type="button" onClick={() => setCategory(cat.value as HabitCategory)} className={cn('p-3 rounded-lg text-center', category === cat.value ? 'bg-[var(--primary)]/20 border-2 border-[var(--primary)]' : 'bg-[var(--secondary)] border-2 border-transparent')}>
                      <span className="text-2xl block">{cat.emoji}</span>
                      <span className="text-xs text-[var(--foreground)]">{cat.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  {HABIT_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)} className={cn('w-8 h-8 rounded-full', color === c && 'ring-2 ring-offset-2 ring-[var(--muted)] scale-110')} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setFrequency('daily')} className={cn('flex-1 py-2 rounded-lg', frequency === 'daily' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--foreground)]')}>Daily</button>
                  <button type="button" onClick={() => setFrequency('weekly')} className={cn('flex-1 py-2 rounded-lg', frequency === 'weekly' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--foreground)]')}>Weekly</button>
                </div>
                {frequency === 'weekly' && (
                  <div className="flex space-x-2">
                    {DAY_ABBREVS.map((day) => (
                      <button key={day} type="button" onClick={() => toggleDay(day)} className={cn('w-10 h-10 rounded-lg', selectedDays.includes(day) ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)] text-[var(--foreground)]')}>{day}</button>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Daily Target</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={isNaN(targetHours) ? '' : targetHours}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = val === '' ? 0 : parseInt(val) || 0;
                          setTargetHours(Math.min(12, Math.max(0, num)));
                        }}
                        className="w-20 px-3 py-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] text-center"
                        placeholder="0"
                      />
                      <span className="text-[var(--muted)]">hours</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={isNaN(targetMinutes) ? '' : targetMinutes}
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = val === '' ? 0 : parseInt(val) || 0;
                          setTargetMinutes(Math.min(59, Math.max(0, num)));
                        }}
                        className="w-20 px-3 py-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] text-center"
                        placeholder="30"
                      />
                      <span className="text-[var(--muted)]">minutes</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Target: {isNaN(targetHours) || isNaN(targetMinutes) ? '0m' : `${targetHours > 0 ? `${targetHours}h ` : ''}${targetMinutes}m`} per day
                  </p>
                </div>
                <div className="flex space-x-2 pt-4">
                  {selectedHabitId && <Button type="button" variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>}
                  <Button type="button" variant="outline" onClick={() => toggleHabitModal(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>{selectedHabitId ? 'Save Changes' : 'Create Habit'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
