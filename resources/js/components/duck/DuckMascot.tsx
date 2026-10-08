import React, { useState, useEffect } from 'react';
import type { DuckMood } from '@/types/duck';
import { playQuackSound } from '@/lib/duck-sound';

interface DuckMascotProps {
    mood?: DuckMood;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    interactive?: boolean;
    animated?: boolean;
    className?: string;
    soundEnabled?: boolean;
    soundVolume?: number;
    onClick?: () => void;
    showSpeechBubble?: boolean;
    speechText?: string;
    showSignboard?: boolean;
}

const SIZE_MAP = {
    xs: 'w-7 h-7',
    sm: 'w-11 h-11',
    md: 'w-20 h-20',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
    '2xl': 'w-64 h-64',
};

// Elizabeth's iconic Gintama signboard quotes
const ELIZABETH_SIGNS = [
    'Zura ja nai, Elizabeth da.',
    'Focus on your tasks.',
    'Did you drink water yet?',
    'Steady paddling wins the day.',
    'No slacking off.',
    'Katsura-san is watching.',
    'Reward yourself with yakisoba pan.',
    'I have no lines, only signs.',
    'Clear the tasks, save the pond.',
    'Concentrate, damn it.',
];

export const DuckMascot: React.FC<DuckMascotProps> = ({
    mood = 'normal',
    size = 'md',
    interactive = false,
    animated = true,
    className = '',
    soundEnabled = true,
    soundVolume = 0.5,
    onClick,
    showSpeechBubble = false,
    speechText,
    showSignboard = true,
}) => {
    const [isWiggling, setIsWiggling] = useState(false);
    const [bubbleVisible, setBubbleVisible] = useState(showSpeechBubble);
    const [customSpeech, setCustomSpeech] = useState(speechText);
    const [currentSignIndex, setCurrentSignIndex] = useState(0);
    const [showHairyLegs, setShowHairyLegs] = useState(false);

    useEffect(() => {
        setBubbleVisible(showSpeechBubble);
        setCustomSpeech(speechText);
    }, [showSpeechBubble, speechText]);

    const handleClick = () => {
        if (!interactive) return;

        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 500);

        // Easter egg: 25% chance of showing hairy legs peek!
        if (Math.random() < 0.35) {
            setShowHairyLegs(true);
            setTimeout(() => setShowHairyLegs(false), 2200);
        }

        // Cycle signboard text
        setCurrentSignIndex((prev) => (prev + 1) % ELIZABETH_SIGNS.length);

        if (soundEnabled) {
            playQuackSound(soundVolume);
        }

        if (onClick) {
            onClick();
        } else {
            const quote = ELIZABETH_SIGNS[(currentSignIndex + 1) % ELIZABETH_SIGNS.length];
            setCustomSpeech(quote);
            setBubbleVisible(true);
            setTimeout(() => setBubbleVisible(false), 4000);
        }
    };

    // Determine default signboard text based on mood
    const getMoodSignText = () => {
        if (customSpeech) return customSpeech;
        switch (mood) {
            case 'completed':
                return 'TASKS CLEARED! ☆';
            case 'focus':
                return 'FOCUSING. SHH.';
            case 'break':
                return 'ON BREAK. ZURA CAN WAIT.';
            case 'no_tasks':
                return 'ALL DONE. SLEEPING.';
            default:
                return ELIZABETH_SIGNS[currentSignIndex] || 'STAY FOCUSED.';
        }
    };

    const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
    const isTiny = size === 'xs' || size === 'sm';

    return (
        <div
            className={`relative inline-flex flex-col items-center justify-center select-none ${
                interactive ? 'cursor-pointer group' : ''
            } ${className}`}
            onClick={handleClick}
            title={interactive ? 'Click to flip Elizabeth\'s sign!' : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            {/* Top Speech / Placard Bubble */}
            {bubbleVisible && customSpeech && (
                <div className="absolute -top-14 z-20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-neutral-900 text-neutral-50 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xl border-2 border-amber-300 flex items-center gap-1.5">
                        <span className="text-amber-400 font-mono">[看板]</span>
                        <span>{customSpeech}</span>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900 rotate-45 border-r-2 border-b-2 border-amber-300" />
                    </div>
                </div>
            )}

            {/* Elizabeth SVG Mascot */}
            <div
                className={`relative transition-transform duration-300 ${
                    animated ? (mood === 'focus' ? 'animate-duck-float-gentle' : 'animate-duck-float') : ''
                } ${isWiggling ? 'scale-105 rotate-3' : interactive ? 'group-hover:scale-102' : ''}`}
            >
                <svg
                    viewBox="0 0 170 170"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${sizeClass} drop-shadow-md transition-all`}
                >
                    <defs>
                        {/* Shading filter */}
                        <linearGradient id="eliWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="70%" stopColor="#F8FAFC" />
                            <stop offset="100%" stopColor="#E2E8F0" />
                        </linearGradient>

                        <linearGradient id="eliBeakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FBBF24" />
                            <stop offset="60%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>

                        <linearGradient id="signWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FEF3C7" />
                            <stop offset="100%" stopColor="#FDE68A" />
                        </linearGradient>
                    </defs>

                    {/* Water ripples if focus */}
                    {mood === 'focus' && (
                        <g opacity="0.6">
                            <ellipse cx="75" cy="155" rx="52" ry="9" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="6 4" className="animate-ripple origin-center" />
                            <ellipse cx="75" cy="155" rx="38" ry="6" stroke="#0284C7" strokeWidth="1.5" />
                        </g>
                    )}

                    {/* Lily Pad for No Tasks */}
                    {mood === 'no_tasks' && (
                        <g>
                            <ellipse cx="75" cy="153" rx="60" ry="13" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5" />
                            <path d="M 75 153 L 132 150 A 60 13 0 0 1 126 162 Z" fill="#15803D" opacity="0.4" />
                            <circle cx="120" cy="147" r="4.5" fill="#FDA4AF" />
                            <circle cx="120" cy="147" r="2" fill="#FEF08A" />
                        </g>
                    )}

                    {/* Floating inner tube for Break Time */}
                    {mood === 'break' && (
                        <g>
                            <ellipse cx="75" cy="142" rx="50" ry="16" fill="#F43F5E" stroke="#BE123C" strokeWidth="2" />
                            <ellipse cx="75" cy="142" rx="32" ry="10" fill="#FFF1F2" />
                            <path d="M 42 142 A 16 16 0 0 1 58 132" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
                        </g>
                    )}

                    {/* FEET OR EASTER EGG HAIRY LEGS */}
                    {showHairyLegs ? (
                        /* Gintama Easter Egg: Real hairy human legs peeking under Elizabeth's costume! */
                        <g>
                            {/* Left leg */}
                            <rect x="54" y="138" width="13" height="22" rx="4" fill="#FED7AA" stroke="#1E293B" strokeWidth="1.8" />
                            {/* Shin hairs */}
                            <line x1="52" y1="144" x2="55" y2="142" stroke="#1E293B" strokeWidth="1.2" />
                            <line x1="53" y1="149" x2="56" y2="148" stroke="#1E293B" strokeWidth="1.2" />
                            <line x1="66" y1="146" x2="69" y2="144" stroke="#1E293B" strokeWidth="1.2" />
                            <ellipse cx="59" cy="160" rx="9" ry="5" fill="#FED7AA" stroke="#1E293B" strokeWidth="1.8" />

                            {/* Right leg */}
                            <rect x="80" y="138" width="13" height="22" rx="4" fill="#FED7AA" stroke="#1E293B" strokeWidth="1.8" />
                            <line x1="78" y1="145" x2="81" y2="143" stroke="#1E293B" strokeWidth="1.2" />
                            <line x1="92" y1="148" x2="95" y2="146" stroke="#1E293B" strokeWidth="1.2" />
                            <ellipse cx="85" cy="160" rx="9" ry="5" fill="#FED7AA" stroke="#1E293B" strokeWidth="1.8" />
                        </g>
                    ) : (
                        /* Standard Elizabeth yellow webbed feet */
                        <g fill="#F59E0B" stroke="#1E293B" strokeWidth="2">
                            {/* Left Foot */}
                            <path d="M 50 148 C 44 148 38 155 42 160 C 47 163 64 163 68 159 C 70 156 66 148 58 148 Z" />
                            <line x1="48" y1="157" x2="48" y2="161" stroke="#B45309" strokeWidth="1.5" />
                            <line x1="56" y1="157" x2="56" y2="161" stroke="#B45309" strokeWidth="1.5" />

                            {/* Right Foot */}
                            <path d="M 82 148 C 74 148 70 155 74 160 C 79 163 96 163 100 159 C 102 156 98 148 90 148 Z" />
                            <line x1="80" y1="157" x2="80" y2="161" stroke="#B45309" strokeWidth="1.5" />
                            <line x1="88" y1="157" x2="88" y2="161" stroke="#B45309" strokeWidth="1.5" />
                        </g>
                    )}

                    {/* ELIZABETH'S MAIN BODY (Iconic White Sheet / Silhouette) */}
                    <path
                        d="M 44 148 
                           C 42 115 42 75 44 58 
                           C 46 28 60 16 75 16 
                           C 90 16 104 28 106 58 
                           C 108 75 108 115 106 148 
                           C 95 150 85 147 75 148 
                           C 65 147 55 150 44 148 Z"
                        fill="url(#eliWhiteGrad)"
                        stroke="#1E293B"
                        strokeWidth="3.2"
                        strokeLinejoin="round"
                    />

                    {/* Left Arm / Flipper */}
                    <path
                        d="M 45 78 C 30 88 28 106 38 112 C 43 108 45 92 46 80 Z"
                        fill="url(#eliWhiteGrad)"
                        stroke="#1E293B"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />

                    {/* Right Arm / Flipper (holding signboard or raised in celebration) */}
                    {mood === 'completed' ? (
                        <path
                            d="M 105 78 C 118 64 130 68 128 80 C 122 88 112 88 105 84 Z"
                            fill="url(#eliWhiteGrad)"
                            stroke="#1E293B"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                    ) : (
                        <path
                            d="M 105 80 C 118 88 124 102 118 110 C 112 108 107 96 105 84 Z"
                            fill="url(#eliWhiteGrad)"
                            stroke="#1E293B"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* ELIZABETH'S ICONIC DEADPAN EYES */}
                    {mood === 'no_tasks' ? (
                        /* Closed sleeping eyes - - */
                        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round">
                            <line x1="60" y1="52" x2="70" y2="52" />
                            <line x1="80" y1="52" x2="90" y2="52" />
                            {/* Floating Zzz */}
                            <g fill="#93C5FD" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                                <text x="100" y="38">z</text>
                                <text x="110" y="27" fontSize="16">Z</text>
                                <text x="122" y="16" fontSize="19">Z</text>
                            </g>
                        </g>
                    ) : mood === 'completed' ? (
                        /* Joyful squinting comic eyes ^ ^ */
                        <g stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" fill="none">
                            <path d="M 59 55 Q 65 47 71 55" />
                            <path d="M 79 55 Q 85 47 91 55" />
                        </g>
                    ) : mood === 'break' ? (
                        /* Cool Sunglasses */
                        <g>
                            <rect x="56" y="46" width="16" height="13" rx="2" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />
                            <rect x="78" y="46" width="16" height="13" rx="2" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />
                            <line x1="72" y1="51" x2="78" y2="51" stroke="#0F172A" strokeWidth="2.5" />
                            <line x1="58" y1="49" x2="68" y2="54" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                            <line x1="80" y1="49" x2="90" y2="54" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                        </g>
                    ) : (
                        /* Elizabeth's Trademark Deadpan Staring Eyes */
                        <g>
                            {/* Left Eye */}
                            <circle cx="65" cy="52" r="9" fill="white" stroke="#1E293B" strokeWidth="2.8" />
                            <circle cx="66" cy="52" r="2.8" fill="#1E293B" />
                            {/* Right Eye */}
                            <circle cx="85" cy="52" r="9" fill="white" stroke="#1E293B" strokeWidth="2.8" />
                            <circle cx="84" cy="52" r="2.8" fill="#1E293B" />

                            {/* Focus Mode: Intense Eyebrows */}
                            {mood === 'focus' && (
                                <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="58" y1="40" x2="71" y2="44" />
                                    <line x1="92" y1="40" x2="79" y2="44" />
                                </g>
                            )}
                        </g>
                    )}

                    {/* ELIZABETH'S DISTINCTIVE FLAT DUCK BEAK / BILL */}
                    <g>
                        {/* Upper Bill */}
                        <path
                            d="M 58 72 
                               C 58 64 66 61 75 61 
                               C 84 61 92 64 92 72 
                               C 92 77 84 81 75 81 
                               C 66 81 58 77 58 72 Z"
                            fill="url(#eliBeakGrad)"
                            stroke="#1E293B"
                            strokeWidth="2.8"
                        />
                        {/* Horizontal Beak Part Line */}
                        <path d="M 60 72 Q 75 74 90 72" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        {/* Subtle Lip Contour */}
                        <ellipse cx="75" cy="77" rx="9" ry="3" fill="#D97706" opacity="0.3" />
                    </g>

                    {/* MOOD SPECIFIC ACCESSORIES */}

                    {/* Focus Mode: Samurai "必勝" (Certain Victory) Headband */}
                    {mood === 'focus' && (
                        <g>
                            {/* Headband cloth */}
                            <path d="M 46 36 Q 75 33 104 36" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="75" cy="35" r="4" fill="white" />
                            <circle cx="75" cy="35" r="2" fill="#EF4444" />
                            {/* Flowing headband ribbons on side */}
                            <path d="M 44 36 Q 36 40 32 50" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" fill="none" />
                            <path d="M 45 38 Q 38 46 38 56" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" fill="none" />
                        </g>
                    )}

                    {/* Completed Mode: Party Cone Hat & Sparkles */}
                    {mood === 'completed' && (
                        <g>
                            <polygon points="75,2 62,24 88,24" fill="#EC4899" stroke="#1E293B" strokeWidth="2" />
                            <line x1="66" y1="18" x2="84" y2="18" stroke="#FDE047" strokeWidth="2.5" />
                            <line x1="69" y1="10" x2="81" y2="10" stroke="#38BDF8" strokeWidth="2" />
                            <circle cx="75" cy="2" r="3.5" fill="#FBBF24" />
                            {/* Sparkles */}
                            <path d="M 116 28 L 118 34 L 124 36 L 118 38 L 116 44 L 114 38 L 108 36 L 114 34 Z" fill="#FBBF24" />
                            <path d="M 36 34 L 38 39 L 43 40 L 38 41 L 36 46 L 34 41 L 29 40 L 34 39 Z" fill="#F43F5E" />
                        </g>
                    )}

                    {/* Break Mode: Strawberry Milk Carton */}
                    {mood === 'break' && (
                        <g transform="translate(10, 10)">
                            <rect x="24" y="90" width="16" height="22" rx="2" fill="#FCE7F3" stroke="#1E293B" strokeWidth="1.8" />
                            <polygon points="24,90 32,84 40,90" fill="#F472B6" stroke="#1E293B" strokeWidth="1.5" />
                            <line x1="32" y1="84" x2="36" y2="72" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                            <text x="26" y="103" fontSize="6" fontWeight="bold" fill="#DB2777" fontFamily="sans-serif">MILK</text>
                        </g>
                    )}

                    {/* THE FAMOUS ELIZABETH SIGNBOARD (Placard / 看板) */}
                    {showSignboard && !isTiny && (
                        <g className="transition-all duration-300">
                            {/* Wooden Handle / Stick */}
                            <rect
                                x="118"
                                y="70"
                                width="5"
                                height="48"
                                rx="1.5"
                                fill="#B45309"
                                stroke="#1E293B"
                                strokeWidth="1.5"
                            />

                            {/* Signboard Body */}
                            <g transform="rotate(-4 135 75)">
                                <rect
                                    x="96"
                                    y="52"
                                    width="68"
                                    height="42"
                                    rx="4"
                                    fill="url(#signWoodGrad)"
                                    stroke="#1E293B"
                                    strokeWidth="2.2"
                                />
                                {/* Wood grain lines */}
                                <line x1="99" y1="58" x2="161" y2="58" stroke="#F59E0B" strokeWidth="0.8" opacity="0.4" />
                                <line x1="99" y1="88" x2="161" y2="88" stroke="#F59E0B" strokeWidth="0.8" opacity="0.4" />

                                {/* Placard Header text (看板) */}
                                <rect x="99" y="55" width="22" height="7" rx="1.5" fill="#78350F" />
                                <text
                                    x="101"
                                    y="60.5"
                                    fill="white"
                                    fontSize="5"
                                    fontWeight="bold"
                                    fontFamily="sans-serif"
                                >
                                    看板
                                </text>

                                {/* Dynamic Text inside the placard */}
                                <foreignObject x="99" y="63" width="62" height="28">
                                    <div className="h-full flex items-center justify-center text-center leading-tight px-0.5">
                                        <span className="text-[7.5px] font-black text-neutral-900 tracking-tight select-none">
                                            {getMoodSignText()}
                                        </span>
                                    </div>
                                </foreignObject>
                            </g>

                            {/* Right flipper grip over handle */}
                            <circle cx="120" cy="88" r="4.5" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.8" />
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
};
