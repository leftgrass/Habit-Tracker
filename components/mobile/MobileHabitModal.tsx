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

export function MobileHabitModal() {
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
    if (selectedHabitId && confirm('Delete this habit?')) {
      deleteHabit(selectedHabitId);
      toggleHabitModal(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  if (!isHabitModalOpen) return null;

  return (
    <AnimatePresence>
      {isHabitModalOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => toggleHabitModal(false)} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed inset-x-0 bottom-0 z-50 bg-[var(--card-bg)] rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center py-2"><div className="w-10 h-1 bg-[var(--card-border)] rounded-full" /></div>
            <div className="px-4 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{selectedHabitId ? 'Edit Habit' : 'New Habit'}</h2>
                <button onClick={() => toggleHabitModal(false)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'var(--secondary)', border: 'none', cursor: 'pointer' }}>
                  <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" className="w-full px-3 py-2.5 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] text-base" autoFocus />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2.5 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] resize-none" />
                <div className="grid grid-cols-5 gap-1.5">{CATEGORIES.map((cat) => (<button key={cat.value} type="button" onClick={() => setCategory(cat.value as HabitCategory)} className={cn('flex flex-col items-center p-1.5 rounded-lg', category === cat.value ? 'bg-[var(--primary)]/20 border border-[var(--primary)]' : 'bg-[var(--secondary)]')}><span className="text-lg">{cat.emoji}</span><span className="text-[8px]">{cat.label}</span></button>))}</div>
                <div className="flex flex-wrap gap-1.5">{HABIT_COLORS.map((c) => (<button key={c} type="button" onClick={() => setColor(c)} className={cn('w-7 h-7 rounded-full', color === c && 'ring-2 ring-offset-1 ring-[var(--foreground)]')} style={{ backgroundColor: c }} />))}</div>
                <div className="flex gap-2"><button type="button" onClick={() => setFrequency('daily')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium', frequency === 'daily' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]')}>Daily</button><button type="button" onClick={() => setFrequency('weekly')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium', frequency === 'weekly' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]')}>Weekly</button></div>
                {frequency === 'weekly' && <div className="flex flex-wrap gap-1">{DAY_ABBREVS.map((day) => (<button key={day} type="button" onClick={() => toggleDay(day)} className={cn('w-8 h-8 rounded-lg text-xs font-medium', selectedDays.includes(day) ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]')}>{day}</button>))}</div>}
                <div className="space-y-1"><label className="text-xs text-[var(--muted)]">Daily Target</label><div className="flex items-center gap-2"><div className="flex-1"><input type="number" min="0" max="12" value={isNaN(targetHours) ? '' : targetHours} onChange={(e) => { const val = e.target.value; const num = val === '' ? 0 : parseInt(val) || 0; setTargetHours(Math.min(12, Math.max(0, num))); }} className="w-full px-3 py-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] text-center" placeholder="0" /><span className="text-[10px] text-[var(--muted)] block text-center">hrs</span></div><span className="text-[var(--muted)]">:</span><div className="flex-1"><input type="number" min="0" max="59" value={isNaN(targetMinutes) ? '' : targetMinutes} onChange={(e) => { const val = e.target.value; const num = val === '' ? 0 : parseInt(val) || 0; setTargetMinutes(Math.min(59, Math.max(0, num))); }} className="w-full px-3 py-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] text-center" placeholder="30" /><span className="text-[10px] text-[var(--muted)] block text-center">min</span></div></div></div>
                <div className="flex gap-2 pt-2">{selectedHabitId && <Button type="button" variant="danger" onClick={handleDelete} className="flex-1 py-2">Delete</Button>}<Button type="button" variant="outline" onClick={() => toggleHabitModal(false)} className="flex-1 py-2">Cancel</Button><Button type="submit" variant="primary" className="flex-1 py-2" disabled={!name.trim()}>{selectedHabitId ? 'Save' : 'Create'}</Button></div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
