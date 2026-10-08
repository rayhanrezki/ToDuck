import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    CheckCircle2,
    Circle,
    Clock,
    Calendar,
    Filter,
    Tag,
    AlertCircle,
    Check,
    X,
} from 'lucide-react';
import type { DuckTask, Priority, TaskCategory } from '@/types/duck';
import { DuckMascot } from './DuckMascot';
import { DuckFootprintIcon, DuckFootprints } from './DuckFootprints';
import { playSuccessChime, playQuackSound } from '@/lib/duck-sound';
import { getTodayDateString } from '@/hooks/use-duck-storage';

interface TasksViewProps {
    tasks: DuckTask[];
    soundEnabled: boolean;
    soundVolume: number;
    onAddTask: (task: {
        title: string;
        notes?: string;
        dueDate: string;
        dueTime: string;
        priority: Priority;
        category: TaskCategory;
    }) => void;
    onUpdateTask: (id: string, updates: Partial<DuckTask>) => void;
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    onClearCompleted: () => void;
    onStartFocus?: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
    tasks,
    soundEnabled,
    soundVolume,
    onAddTask,
    onUpdateTask,
    onToggleTask,
    onDeleteTask,
    onClearCompleted,
    onStartFocus,
}) => {
    const today = getTodayDateString();

    // Filters and Search
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'today' | 'pending' | 'completed' | 'high'>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
    const [sortBy, setSortBy] = useState<'time' | 'priority' | 'newest'>('time');

    // Add / Edit Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<DuckTask | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formDate, setFormDate] = useState(today);
    const [formTime, setFormTime] = useState('12:00');
    const [formPriority, setFormPriority] = useState<Priority>('medium');
    const [formCategory, setFormCategory] = useState<TaskCategory>('work');

    const openAddModal = () => {
        setEditingTask(null);
        setFormTitle('');
        setFormNotes('');
        setFormDate(today);
        setFormTime('12:00');
        setFormPriority('medium');
        setFormCategory('work');
        setIsAddModalOpen(true);
    };

    const openEditModal = (task: DuckTask) => {
        setEditingTask(task);
        setFormTitle(task.title);
        setFormNotes(task.notes || '');
        setFormDate(task.dueDate);
        setFormTime(task.dueTime);
        setFormPriority(task.priority);
        setFormCategory(task.category);
        setIsAddModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        if (editingTask) {
            onUpdateTask(editingTask.id, {
                title: formTitle.trim(),
                notes: formNotes.trim(),
                dueDate: formDate,
                dueTime: formTime,
                priority: formPriority,
                category: formCategory,
            });
            if (soundEnabled) playQuackSound(soundVolume * 0.5);
        } else {
            onAddTask({
                title: formTitle.trim(),
                notes: formNotes.trim(),
                dueDate: formDate,
                dueTime: formTime,
                priority: formPriority,
                category: formCategory,
            });
            if (soundEnabled) playQuackSound(soundVolume * 0.8);
        }

        setIsAddModalOpen(false);
    };

    const handleToggleTask = (task: DuckTask) => {
        onToggleTask(task.id);
        if (!task.completed && soundEnabled) {
            playSuccessChime(soundVolume);
        }
    };

    // Filter and Sort Logic
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Text search
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchTitle = task.title.toLowerCase().includes(query);
                const matchNotes = task.notes?.toLowerCase().includes(query) || false;
                if (!matchTitle && !matchNotes) return false;
            }

            // Category filter
            if (categoryFilter !== 'all' && task.category !== categoryFilter) {
                return false;
            }

            // Tab filter
            if (filterTab === 'today') {
                return task.dueDate === today;
            }
            if (filterTab === 'pending') {
                return !task.completed;
            }
            if (filterTab === 'completed') {
                return task.completed;
            }
            if (filterTab === 'high') {
                return task.priority === 'high';
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'time') {
                // If same date, sort by time, otherwise date
                const dateCompare = a.dueDate.localeCompare(b.dueDate);
                if (dateCompare !== 0) return dateCompare;
                return a.dueTime.localeCompare(b.dueTime);
            }
            if (sortBy === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                return priorityWeight[b.priority] - priorityWeight[a.priority];
            }
            // newest
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [tasks, searchQuery, filterTab, categoryFilter, sortBy, today]);

    const priorityBadge = (priority: Priority) => {
        const styles = {
            high: 'bg-rose-50 text-rose-700 border-rose-200/80',
            medium: 'bg-amber-50 text-amber-700 border-amber-200/80',
            low: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        };
        return (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[priority]}`}>
                {priority}
            </span>
        );
    };

    const categoryBadge = (cat: TaskCategory) => {
        const icons: Record<TaskCategory, string> = {
            work: '💼 Work',
            study: '📚 Study',
            personal: '🌱 Personal',
            pond: '🦆 Pond',
        };
        return (
            <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
                {icons[cat]}
            </span>
        );
    };

    const completedCount = tasks.filter((t) => t.completed).length;

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-sm p-5 rounded-3xl border border-amber-100/80 shadow-xs">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                        <DuckFootprintIcon size={14} fill="#B45309" />
                        <span>Tasks Management</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 mt-0.5">
                        Your Daily Pond Tasks 🦆
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1">
                        Organize your goals, assign priorities, and check them off steadily.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {completedCount > 0 && (
                        <button
                            onClick={onClearCompleted}
                            className="px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-800 text-xs font-medium hover:bg-neutral-50 transition cursor-pointer"
                        >
                            Clear Completed ({completedCount})
                        </button>
                    )}
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Task</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100/80 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search tasks by name or notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50/70 border border-neutral-200 text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Category Selector */}
                    <div className="flex items-center gap-2">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as 'all' | TaskCategory)}
                            className="px-3 py-2 rounded-xl bg-neutral-50/70 border border-neutral-200 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            <option value="work">💼 Work</option>
                            <option value="study">📚 Study</option>
                            <option value="personal">🌱 Personal</option>
                            <option value="pond">🦆 Pond Chores</option>
                        </select>

                        {/* Sort Selector */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'newest')}
                            className="px-3 py-2 rounded-xl bg-neutral-50/70 border border-neutral-200 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                        >
                            <option value="time">Sort: Due Time</option>
                            <option value="priority">Sort: Priority (High First)</option>
                            <option value="newest">Sort: Recently Added</option>
                        </select>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
                    {[
                        { id: 'all', label: 'All Tasks', count: tasks.length },
                        { id: 'today', label: 'Today', count: tasks.filter((t) => t.dueDate === today).length },
                        { id: 'pending', label: 'Pending', count: tasks.filter((t) => !t.completed).length },
                        { id: 'completed', label: 'Completed', count: completedCount },
                        { id: 'high', label: 'High Priority', count: tasks.filter((t) => t.priority === 'high').length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterTab(tab.id as typeof filterTab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                filterTab === tab.id
                                    ? 'bg-amber-400 text-amber-950 font-bold shadow-2xs'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                    filterTab === tab.id ? 'bg-amber-500/40 text-amber-950' : 'bg-neutral-200/70 text-neutral-600'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-amber-100/80 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                    <DuckMascot mood={filterTab === 'completed' ? 'completed' : 'no_tasks'} size="lg" />
                    <div>
                        <h3 className="text-base font-bold text-neutral-800">No tasks in this view</h3>
                        <p className="text-xs text-neutral-500 max-w-sm mt-1">
                            {filterTab === 'completed'
                                ? "No tasks marked as completed yet. Start checking off your pond goals!"
                                : searchQuery
                                ? "No tasks matching your search query. Try clearing the filter."
                                : "The pond is quiet! Tap below to add a new task."}
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition cursor-pointer"
                    >
                        + Create a Task
                    </button>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                                task.completed
                                    ? 'bg-neutral-50/80 border-neutral-200/60 opacity-60'
                                    : 'bg-white hover:bg-amber-50/20 border-amber-100/70 hover:border-amber-200 shadow-2xs'
                            }`}
                        >
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => handleToggleTask(task)}
                                    className="shrink-0 mt-0.5 sm:mt-0 text-amber-500 hover:text-amber-600 transition cursor-pointer"
                                >
                                    {task.completed ? (
                                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500 text-white" />
                                    ) : (
                                        <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-300 group-hover:text-amber-400" />
                                    )}
                                </button>

                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`text-sm sm:text-base font-medium break-words ${
                                                task.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                                            }`}
                                        >
                                            {task.title}
                                        </span>
                                        {categoryBadge(task.category)}
                                        {priorityBadge(task.priority)}
                                    </div>

                                    {task.notes && (
                                        <p className="text-xs text-neutral-500 leading-relaxed">
                                            {task.notes}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-400 pt-0.5">
                                        <span className="flex items-center gap-1 font-medium text-neutral-600">
                                            <Calendar className="w-3 h-3 text-amber-600" />
                                            {task.dueDate === today ? 'Today' : task.dueDate}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium text-neutral-600">
                                            <Clock className="w-3 h-3 text-amber-600" />
                                            {task.dueTime}
                                        </span>
                                        {task.completedAt && (
                                            <span className="text-emerald-600 font-medium">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                                {!task.completed && onStartFocus && (
                                    <button
                                        onClick={() => onStartFocus(task.id)}
                                        title="Start Pomodoro Focus on this task"
                                        className="p-2 rounded-xl text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                                    >
                                        <Clock className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => openEditModal(task)}
                                    title="Edit Task"
                                    className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Delete "${task.title}"?`)) {
                                            onDeleteTask(task.id);
                                        }
                                    }}
                                    title="Delete Task"
                                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Task Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-amber-100 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
                        role="dialog"
                    >
                        <div className="flex items-center justify-between border-b border-amber-100/60 pb-3">
                            <div className="flex items-center gap-2">
                                <DuckMascot mood="normal" size="xs" animated={false} />
                                <h3 className="font-bold text-neutral-800 text-base">
                                    {editingTask ? 'Edit Task' : 'Add New Task'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                    Task Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Complete quarterly report or pond swim"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                                />
                            </div>

                            {/* Notes / Description */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    placeholder="Additional context or checklist items..."
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    rows={2}
                                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                                />
                            </div>

                            {/* Date & Time Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Scheduled Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Due Time
                                    </label>
                                    <input
                                        type="time"
                                        value={formTime}
                                        onChange={(e) => setFormTime(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                            </div>

                            {/* Priority & Category Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={formPriority}
                                        onChange={(e) => setFormPriority(e.target.value as Priority)}
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    >
                                        <option value="low">🌱 Low</option>
                                        <option value="medium">⚡ Medium</option>
                                        <option value="high">🔥 High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    >
                                        <option value="work">💼 Work</option>
                                        <option value="study">📚 Study</option>
                                        <option value="personal">🌱 Personal</option>
                                        <option value="pond">🦆 Pond Chores</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-neutral-600 hover:text-neutral-800 text-xs font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition shadow-xs cursor-pointer"
                                >
                                    {editingTask ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

