import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DuckTask, DuckSettings, FocusSessionLog, Priority, TaskCategory } from '@/types/duck';

const STORAGE_KEYS = {
    TASKS: 'duck_tasks_v1',
    SETTINGS: 'duck_settings_v1',
    FOCUS_LOGS: 'duck_focus_logs_v1',
};

export const DEFAULT_SETTINGS: DuckSettings = {
    mascotName: 'Elizabeth',
    focusDurationMinutes: 25,
    shortBreakDurationMinutes: 5,
    longBreakDurationMinutes: 15,
    soundEnabled: true,
    soundVolume: 0.5,
    autoStartBreaks: false,
    celebrationConfetti: true,
    themeStyle: 'cream',
};

export function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function generateSampleTasks(): DuckTask[] {
    const today = getTodayDateString();
    return [
        {
            id: 'task-1',
            title: 'Morning pond patrol with Katsura-san',
            notes: 'Check all perimeter waters and prepare fresh signboards for the day.',
            dueDate: today,
            dueTime: '08:30',
            priority: 'low',
            category: 'personal',
            completed: true,
            completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
            id: 'task-2',
            title: 'Restock yakisoba pan & strawberry milk',
            notes: 'Essential brain fuel for upcoming deep work sprints.',
            dueDate: today,
            dueTime: '10:00',
            priority: 'high',
            category: 'pond',
            completed: true,
            completedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
            id: 'task-3',
            title: 'Deep focus: Product architecture sprint',
            notes: 'Design clean layout components and eliminate unnecessary distractions.',
            dueDate: today,
            dueTime: '13:30',
            priority: 'high',
            category: 'work',
            completed: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: 'task-4',
            title: 'Practice placard calligraphy (看板)',
            notes: 'Make sure handwriting is clean, concise, and impactful.',
            dueDate: today,
            dueTime: '15:45',
            priority: 'medium',
            category: 'study',
            completed: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: 'task-5',
            title: 'Evening lake stroll & stretch',
            notes: 'Cool down and reflect on today’s completed missions.',
            dueDate: today,
            dueTime: '17:30',
            priority: 'low',
            category: 'personal',
            completed: false,
            createdAt: new Date().toISOString(),
        },
    ];
}

export function generateSampleLogs(): FocusSessionLog[] {
    return [
        {
            id: 'log-1',
            taskId: 'task-2',
            taskTitle: 'Duck team sprint review',
            durationMinutes: 25,
            completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            mode: 'focus',
        },
        {
            id: 'log-2',
            durationMinutes: 5,
            completedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            mode: 'shortBreak',
        },
    ];
}

export function useDuckStorage() {
    // Tasks State
    const [tasks, setTasks] = useState<DuckTask[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
            if (saved) return JSON.parse(saved);
        } catch {
            // fallback
        }
        return generateSampleTasks();
    });

    // Settings State
    const [settings, setSettings] = useState<DuckSettings>(() => {
        if (typeof window === 'undefined') return DEFAULT_SETTINGS;
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
            // fallback
        }
        return DEFAULT_SETTINGS;
    });

    // Focus Logs State
    const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.FOCUS_LOGS);
            if (saved) return JSON.parse(saved);
        } catch {
            // fallback
        }
        return generateSampleLogs();
    });

    // Persist tasks
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks to localStorage', e);
        }
    }, [tasks]);

    // Persist settings
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving settings to localStorage', e);
        }
    }, [settings]);

    // Persist focus logs
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.FOCUS_LOGS, JSON.stringify(focusLogs));
        } catch (e) {
            console.error('Error saving focus logs to localStorage', e);
        }
    }, [focusLogs]);

    // Add Task
    const addTask = useCallback((taskData: {
        title: string;
        notes?: string;
        dueDate?: string;
        dueTime?: string;
        priority?: Priority;
        category?: TaskCategory;
    }): DuckTask => {
        const newTask: DuckTask = {
            id: `duck-task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: taskData.title.trim() || 'Untitled Duck Task',
            notes: taskData.notes?.trim() || '',
            dueDate: taskData.dueDate || getTodayDateString(),
            dueTime: taskData.dueTime || '12:00',
            priority: taskData.priority || 'medium',
            category: taskData.category || 'personal',
            completed: false,
            createdAt: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);
        return newTask;
    }, []);

    // Update Task
    const updateTask = useCallback((id: string, updates: Partial<DuckTask>) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    }, []);

    // Toggle Task
    const toggleTask = useCallback((id: string) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === id) {
                    const nextCompleted = !t.completed;
                    return {
                        ...t,
                        completed: nextCompleted,
                        completedAt: nextCompleted ? new Date().toISOString() : undefined,
                    };
                }
                return t;
            })
        );
    }, []);

    // Delete Task
    const deleteTask = useCallback((id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Clear completed tasks
    const clearCompletedTasks = useCallback(() => {
        setTasks((prev) => prev.filter((t) => !t.completed));
    }, []);

    // Add Focus Log
    const logFocusSession = useCallback((log: Omit<FocusSessionLog, 'id'>) => {
        const newLog: FocusSessionLog = {
            ...log,
            id: `log-${Date.now()}`,
        };
        setFocusLogs((prev) => [newLog, ...prev]);
    }, []);

    // Update Settings
    const updateSettings = useCallback((updates: Partial<DuckSettings>) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    }, []);

    // Reset to Sample Data
    const resetToSampleData = useCallback(() => {
        setTasks(generateSampleTasks());
        setFocusLogs(generateSampleLogs());
        setSettings(DEFAULT_SETTINGS);
    }, []);

    // Export Data JSON
    const exportData = useCallback(() => {
        const data = {
            tasks,
            settings,
            focusLogs,
            exportedAt: new Date().toISOString(),
            app: 'DuckTimeManagement',
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `duck-productivity-${getTodayDateString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [tasks, settings, focusLogs]);

    // Import Data JSON
    const importData = useCallback((jsonString: string): boolean => {
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed.tasks)) {
                setTasks(parsed.tasks);
            }
            if (parsed.settings && typeof parsed.settings === 'object') {
                setSettings((prev) => ({ ...prev, ...parsed.settings }));
            }
            if (Array.isArray(parsed.focusLogs)) {
                setFocusLogs(parsed.focusLogs);
            }
            return true;
        } catch (e) {
            console.error('Failed to parse import data', e);
            return false;
        }
    }, []);

    // Computed Properties
    const today = getTodayDateString();

    const todayTasks = useMemo(() => {
        return tasks.filter((t) => t.dueDate === today);
    }, [tasks, today]);

    const completedToday = useMemo(() => {
        return todayTasks.filter((t) => t.completed).length;
    }, [todayTasks]);

    const totalToday = todayTasks.length;

    const progressPercentage = useMemo(() => {
        if (totalToday === 0) return 0;
        return Math.round((completedToday / totalToday) * 100);
    }, [completedToday, totalToday]);

    const upcomingTasksToday = useMemo(() => {
        return [...todayTasks]
            .filter((t) => !t.completed)
            .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
    }, [todayTasks]);

    const focusMinutesToday = useMemo(() => {
        return focusLogs
            .filter((log) => log.mode === 'focus' && log.completedAt.startsWith(today))
            .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    }, [focusLogs, today]);

    return {
        tasks,
        settings,
        focusLogs,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        clearCompletedTasks,
        logFocusSession,
        updateSettings,
        resetToSampleData,
        exportData,
        importData,
        today,
        todayTasks,
        completedToday,
        totalToday,
        progressPercentage,
        upcomingTasksToday,
        focusMinutesToday,
    };
}

