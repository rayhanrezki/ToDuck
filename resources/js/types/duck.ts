export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 'work' | 'study' | 'personal' | 'pond';

export interface DuckTask {
    id: string;
    title: string;
    notes?: string;
    dueDate: string; // YYYY-MM-DD
    dueTime: string; // HH:mm (e.g. "09:30")
    priority: Priority;
    category: TaskCategory;
    completed: boolean;
    completedAt?: string;
    createdAt: string;
}

export type DuckMood =
    | 'normal'
    | 'completed'
    | 'focus'
    | 'break'
    | 'no_tasks';

export type NavTab = 'dashboard' | 'tasks' | 'schedule' | 'timer' | 'settings';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface DuckSettings {
    mascotName: string;
    focusDurationMinutes: number;
    shortBreakDurationMinutes: number;
    longBreakDurationMinutes: number;
    soundEnabled: boolean;
    soundVolume: number; // 0 to 1
    autoStartBreaks: boolean;
    celebrationConfetti: boolean;
    themeStyle: 'cream' | 'sunshine' | 'dusk';
}

export interface FocusSessionLog {
    id: string;
    taskId?: string;
    taskTitle?: string;
    durationMinutes: number;
    completedAt: string;
    mode: TimerMode;
}

