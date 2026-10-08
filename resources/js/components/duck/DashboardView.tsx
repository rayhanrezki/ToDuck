import React, { useState } from 'react';
import {
    CheckCircle2,
    Circle,
    Clock,
    Plus,
    Sparkles,
    ArrowRight,
    Flame,
    Target,
    Calendar as CalendarIcon,
    AlertCircle,
} from 'lucide-react';
import type { DuckTask, NavTab, Priority, DuckMood } from '@/types/duck';
import { DuckMascot } from './DuckMascot';
import { DuckFootprintIcon, DuckFootprints } from './DuckFootprints';
import { playSuccessChime, playQuackSound } from '@/lib/duck-sound';

interface DashboardViewProps {
    todayTasks: DuckTask[];
    totalToday: number;
    completedToday: number;
    progressPercentage: number;
    upcomingTasks: DuckTask[];
    focusMinutesToday: number;
    mascotName: string;
    soundEnabled: boolean;
    soundVolume: number;
    onToggleTask: (id: string) => void;
    onAddTask: (task: { title: string; dueTime: string; priority: Priority }) => void;
    onNavigate: (tab: NavTab) => void;
    onStartFocusWithTask?: (taskId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    todayTasks,
    totalToday,
    completedToday,
    progressPercentage,
    upcomingTasks,
    focusMinutesToday,
    mascotName,
    soundEnabled,
    soundVolume,
    onToggleTask,
    onAddTask,
    onNavigate,
    onStartFocusWithTask,
}) => {
    // Quick Add form state
    const [quickTitle, setQuickTitle] = useState('');
    const [quickTime, setQuickTime] = useState('14:00');
    const [quickPriority, setQuickPriority] = useState<Priority>('medium');
    const [showQuickAddForm, setShowQuickAddForm] = useState(false);

    // Format today's date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const getGreeting = () => {
        const hour = today.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Determine duck mascot mood and quote
    let duckMood: DuckMood = 'normal';
    let duckSpeech = `Zura ja nai, Elizabeth da. Let's conquer today's tasks!`;

    if (totalToday === 0) {
        duckMood = 'no_tasks';
        duckSpeech = `All tasks cleared. Taking a quiet nap. 🍃`;
    } else if (progressPercentage === 100) {
        duckMood = 'completed';
        duckSpeech = `Mission complete! Where is my yakisoba pan? 🎉`;
    } else if (progressPercentage >= 60) {
        duckMood = 'normal';
        duckSpeech = `Over halfway there. Katsura-san would be proud. ✨`;
    } else if (progressPercentage > 0) {
        duckMood = 'normal';
        duckSpeech = `Steady progress. Keep holding up those goals! 🐾`;
    } else {
        duckMood = 'normal';
        duckSpeech = `${totalToday} task${totalToday > 1 ? 's' : ''} waiting on the placard today.`;
    }

    const handleQuickAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTitle.trim()) return;

        onAddTask({
            title: quickTitle.trim(),
            dueTime: quickTime,
            priority: quickPriority,
        });

        if (soundEnabled) {
            playQuackSound(soundVolume * 0.7);
        }

        setQuickTitle('');
        setShowQuickAddForm(false);
    };

    const handleTaskCheck = (taskId: string, wasCompleted: boolean) => {
        onToggleTask(taskId);
        if (!wasCompleted && soundEnabled) {
            playSuccessChime(soundVolume);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Top Date & Greeting Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-amber-100/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 mt-0.5 tracking-tight">
                        {getGreeting()}, <span className="text-amber-600">{mascotName}</span>'s Friend! 🦆
                    </h1>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                        onClick={() => setShowQuickAddForm(!showQuickAddForm)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold text-xs transition shadow-xs cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Quick Task</span>
                    </button>
                    <button
                        onClick={() => {
                            if (onStartFocusWithTask) onStartFocusWithTask();
                            onNavigate('timer');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition shadow-xs cursor-pointer active:scale-95"
                    >
                        <Clock className="w-4 h-4" />
                        <span>Start Focus</span>
                    </button>
                </div>
            </div>

            {/* Quick Add Inline Form (Collapsible) */}
            {showQuickAddForm && (
                <form
                    onSubmit={handleQuickAddSubmit}
                    className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <DuckFootprintIcon size={14} fill="#B45309" />
                            Add a Task for Today
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowQuickAddForm(false)}
                            className="text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <input
                            type="text"
                            placeholder="What are we paddling on today?"
                            value={quickTitle}
                            onChange={(e) => setQuickTitle(e.target.value)}
                            autoFocus
                            className="sm:col-span-6 px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <div className="sm:col-span-3 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-200">
                            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                            <input
                                type="time"
                                value={quickTime}
                                onChange={(e) => setQuickTime(e.target.value)}
                                className="w-full text-xs text-neutral-700 bg-transparent focus:outline-none"
                            />
                        </div>
                        <select
                            value={quickPriority}
                            onChange={(e) => setQuickPriority(e.target.value as Priority)}
                            className="sm:col-span-2 px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium</option>
                            <option value="high">High Priority</option>
                        </select>
                        <button
                            type="submit"
                            disabled={!quickTitle.trim()}
                            className="sm:col-span-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium text-xs transition cursor-pointer flex items-center justify-center"
                        >
                            Add
                        </button>
                    </div>
                </form>
            )}

            {/* Mascot Banner & Daily Progress Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Cute Duck Mascot Accent Card (Left, 7 cols) */}
                <div className="lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50/60 to-orange-50/40 rounded-3xl p-6 sm:p-7 border border-amber-200/60 shadow-xs flex flex-col justify-between">
                    <DuckFootprints count={4} className="absolute right-4 top-4" opacity={0.15} />

                    <div className="flex items-center gap-5 sm:gap-6 relative z-10">
                        <div className="shrink-0 bg-white/70 p-3 rounded-2xl shadow-xs border border-amber-100">
                            <DuckMascot
                                mood={duckMood}
                                size="lg"
                                interactive={true}
                                soundEnabled={soundEnabled}
                                soundVolume={soundVolume}
                                showSpeechBubble={false}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/60 text-amber-900 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>[看板] {mascotName}'s Signboard:</span>
                            </div>
                            <p className="text-base sm:text-lg font-medium text-neutral-800 leading-snug">
                                "{duckSpeech}"
                            </p>
                            <p className="text-xs text-neutral-500">
                                Click on {mascotName} to flip the placard to a new sign!
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-amber-200/40 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Duck Pond is calm and ready</span>
                        </div>
                        <button
                            onClick={() => onNavigate('tasks')}
                            className="inline-flex items-center gap-1 text-amber-700 font-semibold hover:text-amber-800 transition cursor-pointer"
                        >
                            <span>Manage all tasks</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Daily Progress Card (Right, 5 cols) */}
                <div className="lg:col-span-5 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-amber-100/80 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                    <Target className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-neutral-800 text-sm">Daily Progress</h3>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-800">
                                {completedToday} / {totalToday} Done
                            </span>
                        </div>

                        {/* Progress Meter */}
                        <div className="space-y-2 my-3">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-neutral-500">Completion</span>
                                <span className="text-amber-700 font-bold text-sm">{progressPercentage}%</span>
                            </div>
                            <div className="w-full h-3.5 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-200/50">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 rounded-full transition-all duration-500 shadow-xs"
                                    style={{ width: `${Math.max(4, progressPercentage)}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100/60">
                                <div className="text-xs text-neutral-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Focus Today</span>
                                </div>
                                <div className="text-lg font-bold text-neutral-800 mt-1">
                                    {focusMinutesToday} <span className="text-xs font-normal text-neutral-500">mins</span>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100/60">
                                <div className="text-xs text-neutral-500 flex items-center gap-1">
                                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                                    <span>Pending</span>
                                </div>
                                <div className="text-lg font-bold text-neutral-800 mt-1">
                                    {totalToday - completedToday} <span className="text-xs font-normal text-neutral-500">left</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigate('timer')}
                        className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-100/60 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Open Pomodoro Focus Timer</span>
                    </button>
                </div>
            </div>

            {/* Main Content Split: Today's Tasks & Upcoming Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Today's Tasks Section (7 cols) */}
                <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-amber-100/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-neutral-800 text-sm">Today's Tasks</h3>
                            <span className="text-xs bg-neutral-100 text-neutral-600 font-semibold px-2 py-0.5 rounded-full">
                                {todayTasks.length}
                            </span>
                        </div>

                        <button
                            onClick={() => onNavigate('tasks')}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                            <span>View all</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {todayTasks.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                            <DuckMascot mood="no_tasks" size="md" />
                            <div>
                                <p className="text-sm font-semibold text-neutral-700">No tasks planned for today</p>
                                <p className="text-xs text-neutral-400 mt-0.5">Enjoy your quiet pond or add a new task!</p>
                            </div>
                            <button
                                onClick={() => setShowQuickAddForm(true)}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-semibold transition cursor-pointer"
                            >
                                + Add First Task
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {todayTasks.slice(0, 5).map((task) => {
                                const priorityColors = {
                                    high: 'bg-rose-50 text-rose-700 border-rose-200/60',
                                    medium: 'bg-amber-50 text-amber-700 border-amber-200/60',
                                    low: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                                };

                                return (
                                    <div
                                        key={task.id}
                                        className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                            task.completed
                                                ? 'bg-neutral-50/70 border-neutral-200/50 opacity-70'
                                                : 'bg-white hover:bg-amber-50/30 border-amber-100/70 hover:border-amber-200 shadow-2xs'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <button
                                                type="button"
                                                onClick={() => handleTaskCheck(task.id, task.completed)}
                                                className="shrink-0 text-amber-500 hover:text-amber-600 transition cursor-pointer"
                                            >
                                                {task.completed ? (
                                                    <CheckCircle2 className="w-5 h-5 fill-amber-500 text-white" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-neutral-300 group-hover:text-amber-400" />
                                                )}
                                            </button>

                                            <div className="min-w-0">
                                                <p
                                                    className={`text-xs sm:text-sm font-medium truncate ${
                                                        task.completed
                                                            ? 'line-through text-neutral-400'
                                                            : 'text-neutral-800'
                                                    }`}
                                                >
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {task.dueTime}
                                                    </span>
                                                    {task.notes && (
                                                        <span className="hidden sm:inline truncate max-w-[140px]">
                                                            • {task.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span
                                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                                                    priorityColors[task.priority]
                                                }`}
                                            >
                                                {task.priority}
                                            </span>

                                            {!task.completed && (
                                                <button
                                                    onClick={() => {
                                                        if (onStartFocusWithTask) onStartFocusWithTask(task.id);
                                                        onNavigate('timer');
                                                    }}
                                                    title="Focus on this task"
                                                    className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-amber-100 text-amber-800 cursor-pointer"
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {todayTasks.length > 5 && (
                                <div className="text-center pt-2">
                                    <button
                                        onClick={() => onNavigate('tasks')}
                                        className="text-xs text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
                                    >
                                        + {todayTasks.length - 5} more tasks in Tasks view
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Upcoming Schedule Preview (5 cols) */}
                <div className="lg:col-span-5 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-amber-100/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs">
                                <Clock className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-neutral-800 text-sm">Upcoming Schedule</h3>
                        </div>

                        <button
                            onClick={() => onNavigate('schedule')}
                            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                        >
                            <span>Timeline</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {upcomingTasks.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 text-neutral-400">
                            <DuckFootprints count={3} opacity={0.3} />
                            <p className="text-xs font-medium text-neutral-600">No remaining scheduled items today</p>
                            <p className="text-[11px]">All caught up with today's timeline!</p>
                        </div>
                    ) : (
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-100">
                            {upcomingTasks.slice(0, 4).map((task, idx) => (
                                <div key={task.id} className="relative group">
                                    {/* Timeline dot */}
                                    <div
                                        className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                                            idx === 0 ? 'bg-orange-500 ring-2 ring-orange-200' : 'bg-amber-300'
                                        }`}
                                    >
                                        {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>

                                    <div className="bg-amber-50/40 hover:bg-amber-50/80 p-3 rounded-2xl border border-amber-100/60 transition">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-neutral-800 truncate">
                                                {task.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full shrink-0">
                                                {task.dueTime}
                                            </span>
                                        </div>
                                        {task.notes && (
                                            <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
                                                {task.notes}
                                            </p>
                                        )}
                                        {idx === 0 && (
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                                                    Up Next
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        if (onStartFocusWithTask) onStartFocusWithTask(task.id);
                                                        onNavigate('timer');
                                                    }}
                                                    className="text-[10px] font-semibold text-neutral-600 hover:text-amber-800 underline cursor-pointer"
                                                >
                                                    Focus now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

