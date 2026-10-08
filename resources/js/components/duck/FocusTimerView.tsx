import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Coffee,
    Sparkles,
    CheckCircle2,
    Award,
    Volume2,
    VolumeX,
} from 'lucide-react';
import type { DuckTask, TimerMode, DuckMood } from '@/types/duck';
import { DuckMascot } from './DuckMascot';
import { DuckFootprintIcon, DuckFootprints } from './DuckFootprints';
import { playTimerDoneAlarm, playQuackSound, playSuccessChime } from '@/lib/duck-sound';

interface FocusTimerViewProps {
    tasks: DuckTask[];
    focusDurationMinutes: number;
    shortBreakDurationMinutes: number;
    longBreakDurationMinutes: number;
    soundEnabled: boolean;
    soundVolume: number;
    mascotName: string;
    onLogSession: (log: {
        taskId?: string;
        taskTitle?: string;
        durationMinutes: number;
        completedAt: string;
        mode: TimerMode;
    }) => void;
    onToggleTask?: (id: string) => void;
    preselectedTaskId?: string;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
    tasks,
    focusDurationMinutes = 25,
    shortBreakDurationMinutes = 5,
    longBreakDurationMinutes = 15,
    soundEnabled = true,
    soundVolume = 0.5,
    mascotName = 'Ducky',
    onLogSession,
    onToggleTask,
    preselectedTaskId,
}) => {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(focusDurationMinutes * 60);
    const [selectedTaskId, setSelectedTaskId] = useState<string>(preselectedTaskId || '');
    const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);
    const [justFinished, setJustFinished] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Get current mode duration in seconds
    const getModeDurationSeconds = (m: TimerMode) => {
        switch (m) {
            case 'focus':
                return focusDurationMinutes * 60;
            case 'shortBreak':
                return shortBreakDurationMinutes * 60;
            case 'longBreak':
                return longBreakDurationMinutes * 60;
        }
    };

    const totalDurationSeconds = getModeDurationSeconds(mode);

    // Switch Mode
    const switchMode = (newMode: TimerMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(getModeDurationSeconds(newMode));
        setJustFinished(false);
    };

    // Start / Pause
    const toggleTimer = () => {
        if (!isRunning) {
            if (soundEnabled) playQuackSound(soundVolume * 0.4);
            setIsRunning(true);
            setJustFinished(false);
        } else {
            setIsRunning(false);
        }
    };

    // Reset Timer
    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(getModeDurationSeconds(mode));
        setJustFinished(false);
    };

    // Timer Interval Effect
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Finished!
                        clearInterval(timerRef.current!);
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, mode, selectedTaskId]);

    // Handle Session Complete
    const handleTimerComplete = () => {
        setIsRunning(false);
        setJustFinished(true);

        if (soundEnabled) {
            playTimerDoneAlarm(soundVolume);
        }

        const selectedTask = tasks.find((t) => t.id === selectedTaskId);

        const durationMins =
            mode === 'focus'
                ? focusDurationMinutes
                : mode === 'shortBreak'
                ? shortBreakDurationMinutes
                : longBreakDurationMinutes;

        onLogSession({
            taskId: selectedTask?.id,
            taskTitle: selectedTask?.title,
            durationMinutes: durationMins,
            completedAt: new Date().toISOString(),
            mode,
        });

        if (mode === 'focus') {
            setSessionsCompletedToday((c) => c + 1);
        }
    };

    // Sync if preselectedTaskId changes from outside
    useEffect(() => {
        if (preselectedTaskId) {
            setSelectedTaskId(preselectedTaskId);
            setMode('focus');
            setTimeLeft(focusDurationMinutes * 60);
        }
    }, [preselectedTaskId, focusDurationMinutes]);

    // Calculate progress fraction
    const progress = Math.min(1, Math.max(0, 1 - timeLeft / totalDurationSeconds));
    const circumference = 2 * Math.PI * 130; // Radius = 130
    const strokeDashoffset = circumference * (1 - progress);

    // Format minutes & seconds
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Compute Duck Mascot Mood
    let mascotMood: DuckMood = 'normal';
    let mascotSpeech = `Tap start. Katsura-san is timing us.`;

    if (justFinished) {
        mascotMood = 'completed';
        mascotSpeech =
            mode === 'focus'
                ? `MISSION COMPLETE! ☆ Great focus! 🎉`
                : `Break time over. Back to the mission. 🦆`;
    } else if (isRunning) {
        if (mode === 'focus') {
            mascotMood = 'focus';
            mascotSpeech = `FOCUSING... NO TALKING. 集中`;
        } else {
            mascotMood = 'break';
            mascotSpeech = `ON BREAK. ZURA CAN WAIT. 休憩 🥤`;
        }
    } else {
        mascotMood = 'normal';
        mascotSpeech =
            mode === 'focus'
                ? `Ready for a 25-minute focus mission? 🎯`
                : `Ready for a strawberry milk break? 🍃`;
    }

    const selectedTask = tasks.find((t) => t.id === selectedTaskId);

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 duration-300">
            {/* Header */}
            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-3xl border border-amber-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                        <DuckFootprintIcon size={14} fill="#B45309" />
                        <span>Pomodoro Focus Timer</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 mt-0.5">
                        Focus & Break Sessions ⏱️
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        25 minutes of deep focus followed by a 5-minute break. Watch {mascotName} paddle along!
                    </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex items-center bg-white border border-neutral-200 rounded-2xl p-1 shadow-2xs self-start sm:self-center">
                    <button
                        onClick={() => switchMode('focus')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            mode === 'focus'
                                ? 'bg-amber-400 text-amber-950 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <span>Focus</span>
                        <span className="text-[10px] font-normal opacity-80">({focusDurationMinutes}m)</span>
                    </button>
                    <button
                        onClick={() => switchMode('shortBreak')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            mode === 'shortBreak'
                                ? 'bg-emerald-400 text-emerald-950 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <span>Short Break</span>
                        <span className="text-[10px] font-normal opacity-80">({shortBreakDurationMinutes}m)</span>
                    </button>
                    <button
                        onClick={() => switchMode('longBreak')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            mode === 'longBreak'
                                ? 'bg-sky-400 text-sky-950 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <span>Long Break</span>
                        <span className="text-[10px] font-normal opacity-80">({longBreakDurationMinutes}m)</span>
                    </button>
                </div>
            </div>

            {/* Main Timer Display Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-amber-100 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
                <DuckFootprints count={5} className="absolute left-6 top-6" opacity={0.15} />
                <DuckFootprints count={5} className="absolute right-6 bottom-6 rotate-180" opacity={0.15} />

                {/* Mascot Speech Bubble */}
                <div className="mb-6 z-10">
                    <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-full shadow-2xs text-xs font-medium text-amber-950">
                        <span className="text-amber-600 font-bold">{mascotName}:</span>
                        <span>{mascotSpeech}</span>
                    </div>
                </div>

                {/* Circular Timer Ring with Animated Centerpiece Duck */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
                        {/* Background track circle */}
                        <circle
                            cx="150"
                            cy="150"
                            r="130"
                            className="stroke-amber-100/70"
                            strokeWidth="14"
                            fill="transparent"
                        />
                        {/* Animated progress circle */}
                        <circle
                            cx="150"
                            cy="150"
                            r="130"
                            className={`transition-all duration-1000 ease-linear ${
                                mode === 'focus'
                                    ? 'stroke-amber-400'
                                    : mode === 'shortBreak'
                                    ? 'stroke-emerald-400'
                                    : 'stroke-sky-400'
                            }`}
                            strokeWidth="14"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                        />
                    </svg>

                    {/* Inside the circle: Countdown and Animated Mascot */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        {/* The Small Animated Duck that changes expression */}
                        <div className="mb-1">
                            <DuckMascot
                                mood={mascotMood}
                                size="md"
                                interactive={true}
                                animated={isRunning}
                                soundEnabled={soundEnabled}
                                soundVolume={soundVolume}
                            />
                        </div>

                        {/* Digits Countdown */}
                        <div className="font-mono text-4xl sm:text-5xl font-black text-neutral-800 tracking-tight">
                            {formattedTime}
                        </div>

                        {/* Mode label */}
                        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mt-1">
                            {mode === 'focus' ? '🎯 Focus Session' : mode === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}
                        </div>
                    </div>
                </div>

                {/* Timer Control Buttons */}
                <div className="flex items-center gap-3 mt-8 z-10">
                    <button
                        onClick={resetTimer}
                        className="p-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer active:scale-95 shadow-2xs"
                        title="Reset Timer"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                            isRunning
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-amber-950 hover:opacity-95 shadow-amber-200'
                        }`}
                    >
                        {isRunning ? (
                            <>
                                <Pause className="w-5 h-5 fill-amber-900" />
                                <span>Pause</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-amber-950" />
                                <span>{timeLeft === totalDurationSeconds ? 'Start Session' : 'Resume'}</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            if (mode === 'focus') {
                                switchMode('shortBreak');
                            } else {
                                switchMode('focus');
                            }
                        }}
                        className="p-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition cursor-pointer active:scale-95 shadow-2xs"
                        title={mode === 'focus' ? 'Skip to break' : 'Skip to focus'}
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                </div>

                {/* Linked Task Selector */}
                <div className="w-full max-w-md mt-8 pt-6 border-t border-neutral-100 text-center space-y-2">
                    <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block">
                        Focusing On Today's Task:
                    </label>
                    <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                        <option value="">-- No specific task (Free Focus) --</option>
                        {tasks
                            .filter((t) => !t.completed)
                            .map((t) => (
                                <option key={t.id} value={t.id}>
                                    [{t.priority.toUpperCase()}] {t.title} ({t.dueTime})
                                </option>
                            ))}
                    </select>

                    {selectedTask && (
                        <div className="flex items-center justify-between bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-xs">
                            <span className="font-medium text-amber-900 truncate">
                                Selected: <strong>{selectedTask.title}</strong>
                            </span>
                            {onToggleTask && !selectedTask.completed && (
                                <button
                                    onClick={() => {
                                        onToggleTask(selectedTask.id);
                                        if (soundEnabled) playSuccessChime(soundVolume);
                                    }}
                                    className="text-amber-700 hover:text-amber-900 font-semibold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Done</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Focus Stats / Motivational Duck Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/80 p-5 rounded-2xl border border-amber-100/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <div className="text-xs text-neutral-400 font-medium">Sessions Today</div>
                        <div className="text-lg font-bold text-neutral-800">
                            {sessionsCompletedToday} <span className="text-xs font-normal text-neutral-500">completed</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 p-5 rounded-2xl border border-amber-100/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                        <Coffee className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <div className="text-xs text-neutral-400 font-medium">Focus Time</div>
                        <div className="text-lg font-bold text-neutral-800">
                            {sessionsCompletedToday * focusDurationMinutes} <span className="text-xs font-normal text-neutral-500">mins</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 p-5 rounded-2xl border border-amber-100/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-xs text-neutral-400 font-medium">Pond Rhythm</div>
                        <div className="text-sm font-bold text-emerald-700">
                            Steady & Calm 🌿
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

