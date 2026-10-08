import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    Timer,
    Settings,
    Volume2,
    VolumeX,
    Sparkles,
    Menu,
    X,
} from 'lucide-react';
import type { NavTab, Priority } from '@/types/duck';
import { useDuckStorage } from '@/hooks/use-duck-storage';
import { DuckMascot } from '@/components/duck/DuckMascot';
import { DuckFootprintIcon, DuckFootprints } from '@/components/duck/DuckFootprints';
import { DashboardView } from '@/components/duck/DashboardView';
import { TasksView } from '@/components/duck/TasksView';
import { ScheduleView } from '@/components/duck/ScheduleView';
import { FocusTimerView } from '@/components/duck/FocusTimerView';
import { SettingsView } from '@/components/duck/SettingsView';
import { playSoftClick } from '@/lib/duck-sound';

export default function DuckDashboardPage() {
    const {
        tasks,
        settings,
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
        todayTasks,
        completedToday,
        totalToday,
        progressPercentage,
        upcomingTasksToday,
        focusMinutesToday,
    } = useDuckStorage();

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<NavTab>(() => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname.replace(/^\//, '');
            if (path === 'tasks') return 'tasks';
            if (path === 'schedule') return 'schedule';
            if (path === 'timer') return 'timer';
            if (path === 'settings') return 'settings';
        }
        return 'dashboard';
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [timerSelectedTaskId, setTimerSelectedTaskId] = useState<string | undefined>(undefined);

    // Sync browser URL without full reload
    const handleTabChange = (tab: NavTab) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
        if (settings.soundEnabled) playSoftClick(settings.soundVolume);

        if (typeof window !== 'undefined') {
            const nextPath = tab === 'dashboard' ? '/' : `/${tab}`;
            if (window.location.pathname !== nextPath) {
                window.history.pushState(null, '', nextPath);
            }
        }
    };

    // Listen to popstate (back/forward navigation)
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname.replace(/^\//, '');
            if (path === 'tasks') setActiveTab('tasks');
            else if (path === 'schedule') setActiveTab('schedule');
            else if (path === 'timer') setActiveTab('timer');
            else if (path === 'settings') setActiveTab('settings');
            else setActiveTab('dashboard');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleStartFocusFromOtherTab = (taskId?: string) => {
        setTimerSelectedTaskId(taskId);
        handleTabChange('timer');
    };

    const pendingTasksCount = tasks.filter((t) => !t.completed).length;

    const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'timer', label: 'Focus Timer', icon: Timer },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <>
            <Head title={`DuckDo - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`} />

            <div className="min-h-screen bg-[#FAF7F2] text-neutral-800 flex flex-col md:flex-row antialiased selection:bg-amber-200 selection:text-amber-900">
                {/* Desktop Sidebar Navigation */}
                <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white/90 backdrop-blur-md border-r border-amber-100/90 shadow-xs p-5 shrink-0 justify-between select-none fixed top-0 bottom-0 left-0 z-30">
                    <div className="space-y-6">
                        {/* App Brand Header */}
                        <div
                            onClick={() => handleTabChange('dashboard')}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-400 p-1 shadow-xs border border-amber-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <DuckMascot mood="normal" size="xs" animated={false} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-lg tracking-tight text-neutral-900">
                                        DuckDo
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                                        Time
                                    </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 font-medium">
                                    Personal Productivity
                                </p>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <nav className="space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleTabChange(item.id)}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-amber-400 text-amber-950 shadow-xs'
                                                : 'text-neutral-600 hover:bg-amber-50/70 hover:text-neutral-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-950' : 'text-neutral-500'}`} />
                                            <span>{item.label}</span>
                                        </div>

                                        {typeof item.badge === 'number' && item.badge > 0 && (
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    isActive
                                                        ? 'bg-amber-500/40 text-amber-950'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Sidebar Mascot Card */}
                    <div className="space-y-3 pt-4 border-t border-amber-100/70">
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 flex items-center gap-3">
                            <DuckMascot
                                mood="normal"
                                size="sm"
                                interactive={true}
                                soundEnabled={settings.soundEnabled}
                                soundVolume={settings.soundVolume}
                                showSignboard={false}
                            />
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-amber-950 truncate flex items-center gap-1">
                                    <span>{settings.mascotName}</span>
                                    <span className="text-[10px] text-amber-700 bg-amber-200/60 px-1 py-0.2 rounded font-mono">看板</span>
                                </div>
                                <div className="text-[11px] text-amber-800/80 truncate">
                                    {progressPercentage}% tasks cleared
                                </div>
                            </div>
                        </div>

                        {/* Sound Toggle Button */}
                        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                            <button
                                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                                className="flex items-center gap-1.5 hover:text-neutral-800 transition cursor-pointer"
                                title="Toggle sounds"
                            >
                                {settings.soundEnabled ? (
                                    <>
                                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Quacks On</span>
                                    </>
                                ) : (
                                    <>
                                        <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                                        <span>Muted</span>
                                    </>
                                )}
                            </button>

                            <DuckFootprints count={2} opacity={0.3} />
                        </div>
                    </div>
                </aside>

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100 px-4 py-3 flex items-center justify-between shadow-2xs">
                    <div
                        onClick={() => handleTabChange('dashboard')}
                        className="flex items-center gap-2.5 cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-xl bg-amber-300 p-0.5 border border-amber-200 flex items-center justify-center">
                            <DuckMascot mood="normal" size="xs" animated={false} />
                        </div>
                        <span className="font-extrabold text-base text-neutral-900">
                            DuckDo
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                            className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                            title="Toggle sound"
                        >
                            {settings.soundEnabled ? (
                                <Volume2 className="w-4 h-4 text-amber-600" />
                            ) : (
                                <VolumeX className="w-4 h-4 text-neutral-400" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 md:ml-64 lg:ml-72 p-4 sm:p-6 lg:p-8 max-w-7xl pb-24 md:pb-8 min-h-screen">
                    {activeTab === 'dashboard' && (
                        <DashboardView
                            todayTasks={todayTasks}
                            totalToday={totalToday}
                            completedToday={completedToday}
                            progressPercentage={progressPercentage}
                            upcomingTasks={upcomingTasksToday}
                            focusMinutesToday={focusMinutesToday}
                            mascotName={settings.mascotName}
                            soundEnabled={settings.soundEnabled}
                            soundVolume={settings.soundVolume}
                            onToggleTask={toggleTask}
                            onAddTask={(task) =>
                                addTask({
                                    title: task.title,
                                    dueTime: task.dueTime,
                                    priority: task.priority,
                                })
                            }
                            onNavigate={handleTabChange}
                            onStartFocusWithTask={handleStartFocusFromOtherTab}
                        />
                    )}

                    {activeTab === 'tasks' && (
                        <TasksView
                            tasks={tasks}
                            soundEnabled={settings.soundEnabled}
                            soundVolume={settings.soundVolume}
                            onAddTask={addTask}
                            onUpdateTask={updateTask}
                            onToggleTask={toggleTask}
                            onDeleteTask={deleteTask}
                            onClearCompleted={clearCompletedTasks}
                            onStartFocus={handleStartFocusFromOtherTab}
                        />
                    )}

                    {activeTab === 'schedule' && (
                        <ScheduleView
                            tasks={tasks}
                            soundEnabled={settings.soundEnabled}
                            soundVolume={settings.soundVolume}
                            onToggleTask={toggleTask}
                            onAddTask={addTask}
                            onStartFocus={handleStartFocusFromOtherTab}
                        />
                    )}

                    {activeTab === 'timer' && (
                        <FocusTimerView
                            tasks={tasks}
                            focusDurationMinutes={settings.focusDurationMinutes}
                            shortBreakDurationMinutes={settings.shortBreakDurationMinutes}
                            longBreakDurationMinutes={settings.longBreakDurationMinutes}
                            soundEnabled={settings.soundEnabled}
                            soundVolume={settings.soundVolume}
                            mascotName={settings.mascotName}
                            onLogSession={logFocusSession}
                            onToggleTask={toggleTask}
                            preselectedTaskId={timerSelectedTaskId}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsView
                            settings={settings}
                            onUpdateSettings={updateSettings}
                            onResetSampleData={resetToSampleData}
                            onExportData={exportData}
                            onImportData={importData}
                        />
                    )}
                </main>

                {/* Mobile Bottom Navigation Bar */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-100 shadow-lg px-2 py-2 flex items-center justify-around select-none">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer relative ${
                                    isActive ? 'text-amber-900 font-bold' : 'text-neutral-400 hover:text-neutral-700'
                                }`}
                            >
                                <div
                                    className={`p-1.5 rounded-xl transition ${
                                        isActive ? 'bg-amber-400 text-amber-950 shadow-2xs' : ''
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] mt-0.5">{item.label}</span>

                                {typeof item.badge === 'number' && item.badge > 0 && !isActive && (
                                    <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}

