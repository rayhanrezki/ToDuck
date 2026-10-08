import React, { useState, useMemo } from 'react';
import {
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    CheckCircle2,
    Circle,
    CalendarDays,
    ListFilter,
} from 'lucide-react';
import type { DuckTask, Priority } from '@/types/duck';
import { DuckMascot } from './DuckMascot';
import { DuckFootprintIcon, DuckFootprints } from './DuckFootprints';
import { playSuccessChime, playQuackSound } from '@/lib/duck-sound';
import { getTodayDateString } from '@/hooks/use-duck-storage';

interface ScheduleViewProps {
    tasks: DuckTask[];
    soundEnabled: boolean;
    soundVolume: number;
    onToggleTask: (id: string) => void;
    onAddTask: (task: {
        title: string;
        notes?: string;
        dueDate: string;
        dueTime: string;
        priority: Priority;
    }) => void;
    onStartFocus?: (taskId: string) => void;
}

// Hourly intervals from 07:00 to 22:00
const TIMELINE_HOURS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00',
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
    tasks,
    soundEnabled,
    soundVolume,
    onToggleTask,
    onAddTask,
    onStartFocus,
}) => {
    const today = getTodayDateString();
    const [selectedDate, setSelectedDate] = useState(today);
    const [viewMode, setViewMode] = useState<'timeline' | 'agenda'>('timeline');

    // Quick add dialog for specific time slot
    const [slotToAdd, setSlotToAdd] = useState<string | null>(null);
    const [slotTaskTitle, setSlotTaskTitle] = useState('');
    const [slotPriority, setSlotPriority] = useState<Priority>('medium');

    // Filter tasks for selected date
    const dateTasks = useMemo(() => {
        return tasks.filter((t) => t.dueDate === selectedDate);
    }, [tasks, selectedDate]);

    // Map tasks to their hour slot (e.g., "09:30" goes to "09:00" bucket)
    const tasksByHour = useMemo(() => {
        const buckets: Record<string, DuckTask[]> = {};
        TIMELINE_HOURS.forEach((h) => (buckets[h] = []));

        dateTasks.forEach((task) => {
            const hour = task.dueTime.split(':')[0] || '12';
            const hourSlot = `${hour.padStart(2, '0')}:00`;
            if (buckets[hourSlot]) {
                buckets[hourSlot].push(task);
            } else {
                // If earlier than 07:00 or later than 22:00, map to nearest
                const parsedHour = parseInt(hour, 10);
                if (parsedHour < 7) {
                    buckets['07:00'].push(task);
                } else {
                    buckets['22:00'].push(task);
                }
            }
        });

        // Sort each bucket by time
        Object.keys(buckets).forEach((slot) => {
            buckets[slot].sort((a, b) => a.dueTime.localeCompare(b.dueTime));
        });

        return buckets;
    }, [dateTasks]);

    // Format current time indicator position
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isToday = selectedDate === today;

    // Calculate vertical % for current time indicator if current time is within 07:00 - 23:00
    const currentTimePercent = useMemo(() => {
        if (!isToday) return null;
        if (currentHour < 7 || currentHour >= 23) return null;
        const totalMinutes = (currentHour - 7) * 60 + currentMinute;
        const timelineTotalMinutes = (23 - 7) * 60; // 16 hours
        return (totalMinutes / timelineTotalMinutes) * 100;
    }, [isToday, currentHour, currentMinute]);

    const handleDateStep = (days: number) => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        d.setDate(d.getDate() + days);
        const nextY = d.getFullYear();
        const nextM = String(d.getMonth() + 1).padStart(2, '0');
        const nextD = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${nextY}-${nextM}-${nextD}`);
    };

    const handleSlotAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!slotTaskTitle.trim() || !slotToAdd) return;

        onAddTask({
            title: slotTaskTitle.trim(),
            dueDate: selectedDate,
            dueTime: slotToAdd,
            priority: slotPriority,
        });

        if (soundEnabled) playQuackSound(soundVolume * 0.7);

        setSlotTaskTitle('');
        setSlotToAdd(null);
    };

    const handleTaskToggle = (task: DuckTask) => {
        onToggleTask(task.id);
        if (!task.completed && soundEnabled) {
            playSuccessChime(soundVolume);
        }
    };

    // Format display date
    const displayDateString = useMemo(() => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }, [selectedDate]);

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Header / Date Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-sm p-5 rounded-3xl border border-amber-100/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Daily Timeline Schedule</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 mt-0.5">
                        {isToday ? "Today's Schedule 📅" : displayDateString}
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Morning to evening visual timeline. Click any time slot to schedule a task.
                    </p>
                </div>

                {/* Day Navigation Controls */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="flex items-center bg-white border border-neutral-200 rounded-2xl p-1 shadow-2xs">
                        <button
                            onClick={() => handleDateStep(-1)}
                            className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-600 transition cursor-pointer"
                            title="Previous Day"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setSelectedDate(today)}
                            className={`px-3 py-1 text-xs font-semibold rounded-xl transition cursor-pointer ${
                                isToday ? 'bg-amber-400 text-amber-950 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => handleDateStep(1)}
                            className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-600 transition cursor-pointer"
                            title="Next Day"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* View mode toggle */}
                    <div className="flex items-center bg-white border border-neutral-200 rounded-2xl p-1 shadow-2xs">
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xl transition cursor-pointer ${
                                viewMode === 'timeline' ? 'bg-amber-100 text-amber-900' : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => setViewMode('agenda')}
                            className={`px-3 py-1 text-xs font-semibold rounded-xl transition cursor-pointer ${
                                viewMode === 'agenda' ? 'bg-amber-100 text-amber-900' : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            Agenda
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick add for slot popup */}
            {slotToAdd && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Schedule Task for {slotToAdd} on {isToday ? 'Today' : selectedDate}</span>
                        </div>
                        <button
                            onClick={() => setSlotToAdd(null)}
                            className="text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSlotAddSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                            type="text"
                            placeholder="Task title..."
                            value={slotTaskTitle}
                            onChange={(e) => setSlotTaskTitle(e.target.value)}
                            autoFocus
                            className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <select
                            value={slotPriority}
                            onChange={(e) => setSlotPriority(e.target.value as Priority)}
                            className="px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="low">🌱 Low</option>
                            <option value="medium">⚡ Medium</option>
                            <option value="high">🔥 High</option>
                        </select>
                        <button
                            type="submit"
                            disabled={!slotTaskTitle.trim()}
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-amber-950 font-bold text-xs transition cursor-pointer"
                        >
                            Add to Timeline
                        </button>
                    </form>
                </div>
            )}

            {/* View Mode: Timeline View */}
            {viewMode === 'timeline' ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-7 border border-amber-100/80 shadow-xs relative">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-100 text-xs text-neutral-500">
                        <span className="font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Morning to Evening (07:00 - 22:00)
                        </span>
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 font-medium">
                            💡 Click any slot to schedule
                        </span>
                    </div>

                    <div className="relative mt-4 space-y-4">
                        {/* Current Time Indicator Line (if today & daytime) */}
                        {currentTimePercent !== null && (
                            <div
                                className="absolute left-16 right-0 z-20 pointer-events-none flex items-center"
                                style={{ top: `${currentTimePercent}%` }}
                            >
                                <div className="absolute -left-3 -top-3 w-6 h-6 flex items-center justify-center">
                                    <DuckMascot mood="normal" size="xs" animated={false} />
                                </div>
                                <div className="w-full border-t-2 border-orange-500 border-dashed shadow-xs" />
                                <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                                    Now
                                </span>
                            </div>
                        )}

                        {/* Hour Slots */}
                        {TIMELINE_HOURS.map((hour) => {
                            const slotTasks = tasksByHour[hour] || [];
                            const hourNum = parseInt(hour.split(':')[0], 10);
                            const period = hourNum >= 12 ? 'PM' : 'AM';
                            const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;

                            return (
                                <div
                                    key={hour}
                                    className="flex items-start gap-4 group min-h-[58px]"
                                >
                                    {/* Time Label */}
                                    <div className="w-16 shrink-0 text-right pt-1">
                                        <span className="text-xs font-bold text-neutral-700">
                                            {displayHour}:00
                                        </span>
                                        <span className="text-[10px] text-neutral-400 font-semibold ml-0.5">
                                            {period}
                                        </span>
                                    </div>

                                    {/* Timeline line and slot content */}
                                    <div className="relative flex-1 pt-1 pb-2 border-b border-neutral-100/80 group-hover:border-amber-200 transition">
                                        {slotTasks.length > 0 ? (
                                            <div className="space-y-2">
                                                {slotTasks.map((task) => {
                                                    const priorityBorder = {
                                                        high: 'border-l-4 border-l-rose-500 bg-rose-50/40 hover:bg-rose-50/80 border-rose-100',
                                                        medium: 'border-l-4 border-l-amber-500 bg-amber-50/40 hover:bg-amber-50/80 border-amber-100',
                                                        low: 'border-l-4 border-l-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 border-emerald-100',
                                                    };

                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                                                priorityBorder[task.priority]
                                                            } ${task.completed ? 'opacity-60' : 'shadow-2xs'}`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTaskToggle(task)}
                                                                    className="shrink-0 text-amber-500 hover:text-amber-600 transition cursor-pointer"
                                                                >
                                                                    {task.completed ? (
                                                                        <CheckCircle2 className="w-5 h-5 fill-amber-500 text-white" />
                                                                    ) : (
                                                                        <Circle className="w-5 h-5 text-neutral-300" />
                                                                    )}
                                                                </button>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`text-xs sm:text-sm font-semibold truncate ${
                                                                                task.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                                                                            }`}
                                                                        >
                                                                            {task.title}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-neutral-500 bg-white/80 px-2 py-0.5 rounded-full border border-neutral-200/50">
                                                                            {task.dueTime}
                                                                        </span>
                                                                    </div>
                                                                    {task.notes && (
                                                                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                                                                            {task.notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {!task.completed && onStartFocus && (
                                                                <button
                                                                    onClick={() => onStartFocus(task.id)}
                                                                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold transition cursor-pointer shrink-0"
                                                                >
                                                                    Focus
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* Empty Hour Slot */
                                            <button
                                                onClick={() => setSlotToAdd(hour)}
                                                className="w-full text-left py-1.5 px-3 rounded-xl border border-transparent hover:border-dashed hover:border-amber-300 hover:bg-amber-50/50 text-neutral-300 hover:text-amber-700 transition flex items-center justify-between text-xs cursor-pointer group/slot"
                                            >
                                                <span className="text-[11px] opacity-0 group-hover/slot:opacity-100 transition">
                                                    + Click to schedule task at {displayHour}:00 {period}
                                                </span>
                                                <Plus className="w-3.5 h-3.5 opacity-0 group-hover/slot:opacity-100 transition" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* View Mode: Agenda Card View */
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-amber-100/80 shadow-xs space-y-4">
                    <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                        <ListFilter className="w-4 h-4 text-amber-600" />
                        <span>Chronological Agenda for {displayDateString}</span>
                    </h3>

                    {dateTasks.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                            <DuckMascot mood="no_tasks" size="md" />
                            <p className="text-sm font-semibold text-neutral-700">No scheduled tasks for this date</p>
                            <p className="text-xs text-neutral-400">Add tasks or choose another date above.</p>
                            <button
                                onClick={() => setSlotToAdd('09:00')}
                                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition cursor-pointer"
                            >
                                + Add Scheduled Task
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[...dateTasks]
                                .sort((a, b) => a.dueTime.localeCompare(b.dueTime))
                                .map((task) => (
                                    <div
                                        key={task.id}
                                        className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                                            task.completed ? 'bg-neutral-50/70 border-neutral-200/50 opacity-60' : 'bg-white border-amber-100/80 shadow-2xs'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleTaskToggle(task)}
                                                className="shrink-0 text-amber-500 hover:text-amber-600 transition cursor-pointer"
                                            >
                                                {task.completed ? (
                                                    <CheckCircle2 className="w-5 h-5 fill-amber-500 text-white" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-neutral-300" />
                                                )}
                                            </button>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                                        {task.dueTime}
                                                    </span>
                                                    <span
                                                        className={`text-sm font-semibold ${
                                                            task.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                                                        }`}
                                                    >
                                                        {task.title}
                                                    </span>
                                                </div>
                                                {task.notes && (
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        {task.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {!task.completed && onStartFocus && (
                                            <button
                                                onClick={() => onStartFocus(task.id)}
                                                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition cursor-pointer shrink-0"
                                            >
                                                Focus
                                            </button>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

