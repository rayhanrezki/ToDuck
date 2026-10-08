import React, { useState } from 'react';
import {
    Sliders,
    Volume2,
    VolumeX,
    Clock,
    Download,
    Upload,
    RotateCcw,
    Sparkles,
    ShieldCheck,
    Check,
    Volume,
} from 'lucide-react';
import type { DuckSettings } from '@/types/duck';
import { DuckMascot } from './DuckMascot';
import { DuckFootprintIcon, DuckFootprints } from './DuckFootprints';
import { playQuackSound, playSuccessChime } from '@/lib/duck-sound';

interface SettingsViewProps {
    settings: DuckSettings;
    onUpdateSettings: (updates: Partial<DuckSettings>) => void;
    onResetSampleData: () => void;
    onExportData: () => void;
    onImportData: (jsonString: string) => boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    settings,
    onUpdateSettings,
    onResetSampleData,
    onExportData,
    onImportData,
}) => {
    const [mascotInput, setMascotInput] = useState(settings.mascotName);
    const [focusInput, setFocusInput] = useState(settings.focusDurationMinutes);
    const [shortBreakInput, setShortBreakInput] = useState(settings.shortBreakDurationMinutes);
    const [longBreakInput, setLongBreakInput] = useState(settings.longBreakDurationMinutes);
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSaveGeneral = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings({
            mascotName: mascotInput.trim() || 'Ducky',
            focusDurationMinutes: Number(focusInput) || 25,
            shortBreakDurationMinutes: Number(shortBreakInput) || 5,
            longBreakDurationMinutes: Number(longBreakInput) || 15,
        });
        if (settings.soundEnabled) playSuccessChime(settings.soundVolume);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const success = onImportData(content);
            if (success) {
                alert('Data successfully imported!');
                if (settings.soundEnabled) playSuccessChime(settings.soundVolume);
            } else {
                alert('Failed to parse backup JSON file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in-50 duration-300">
            {/* Header */}
            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-3xl border border-amber-100/80 shadow-xs flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Preferences</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 mt-0.5">
                        Settings & Duck Pond Customization ⚙️
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Fine-tune your timer durations, sound effects, and mascot personality.
                    </p>
                </div>
                <div className="hidden sm:block">
                    <DuckMascot mood="normal" size="sm" interactive={false} />
                </div>
            </div>

            {/* General & Timer Form */}
            <form onSubmit={handleSaveGeneral} className="bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-amber-100/80 shadow-xs space-y-6">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Timer & Mascot Configuration</span>
                    </h3>
                    {savedNotice && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                            <Check className="w-3.5 h-3.5" />
                            Settings Saved!
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mascot Name */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                            Duck Mascot Name
                        </label>
                        <input
                            type="text"
                            value={mascotInput}
                            onChange={(e) => setMascotInput(e.target.value)}
                            placeholder="Ducky"
                            className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                        />
                    </div>

                    {/* Focus Session Duration */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                            Focus Duration (Minutes)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={120}
                            value={focusInput}
                            onChange={(e) => setFocusInput(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                        />
                    </div>

                    {/* Short Break Duration */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                            Short Break (Minutes)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={30}
                            value={shortBreakInput}
                            onChange={(e) => setShortBreakInput(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                        />
                    </div>

                    {/* Long Break Duration */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                            Long Break (Minutes)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={60}
                            value={longBreakInput}
                            onChange={(e) => setLongBreakInput(Number(e.target.value))}
                            className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs transition shadow-xs cursor-pointer"
                    >
                        Save Preferences
                    </button>
                </div>
            </form>

            {/* Sound & Audio Controls */}
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-amber-100/80 shadow-xs space-y-5">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-600" />
                        <span>Sound Effects & Feedback</span>
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                        <div>
                            <div className="text-xs font-bold text-neutral-800">Duck Quacks & Completion Chimes</div>
                            <div className="text-[11px] text-neutral-500">Play pleasant synthesized sounds when finishing tasks and timers</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                settings.soundEnabled ? 'bg-amber-400' : 'bg-neutral-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Volume Slider & Test Button */}
                    {settings.soundEnabled && (
                        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-neutral-700">Volume Level</label>
                                <span className="text-xs font-mono text-neutral-500">
                                    {Math.round(settings.soundVolume * 100)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Volume className="w-4 h-4 text-neutral-400" />
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.05"
                                    value={settings.soundVolume}
                                    onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                                    className="w-full accent-amber-500 cursor-pointer"
                                />
                                <button
                                    type="button"
                                    onClick={() => playQuackSound(settings.soundVolume)}
                                    className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-semibold cursor-pointer shrink-0 transition"
                                >
                                    Quack Test! 🦆
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Local Data Management */}
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-amber-100/80 shadow-xs space-y-5">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Data Storage & Backups</span>
                    </h3>
                    <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                        100% Local in Browser
                    </span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                    All your tasks, daily progress, and focus records are stored safely right here in your browser's local memory. No remote account or registration required.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={onExportData}
                        className="p-3.5 rounded-2xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50 text-neutral-700 transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-amber-600" />
                        <span>Export Backup</span>
                    </button>

                    <label className="p-3.5 rounded-2xl border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50 text-neutral-700 transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>Import Backup</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={() => {
                            if (confirm('Reset your tasks to default sample duck data?')) {
                                onResetSampleData();
                            }
                        }}
                        className="p-3.5 rounded-2xl border border-neutral-200 hover:border-rose-300 hover:bg-rose-50/50 text-neutral-700 hover:text-rose-700 transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4 text-neutral-500" />
                        <span>Reset Sample Data</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

