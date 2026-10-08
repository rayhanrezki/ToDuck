// Web Audio API Sound Synthesizer for Duck Productivity App
// Self-contained, zero external asset dependencies

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

/**
 * Play a cute synthesized duck squeak / quack
 */
export function playQuackSound(volume: number = 0.5): void {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * 0.45, now);
        masterGain.connect(ctx.destination);

        // First osc: Main quack pitch bend
        const osc1 = ctx.createOscillator();
        const oscGain1 = ctx.createGain();
        osc1.type = 'sawtooth';

        // Frequency sweep from 680Hz down to 420Hz, then slight rise to 460Hz (quack shape)
        osc1.frequency.setValueAtTime(680, now);
        osc1.frequency.exponentialRampToValueAtTime(390, now + 0.12);
        osc1.frequency.linearRampToValueAtTime(430, now + 0.18);

        // Bandpass filter to simulate duck beak acoustic resonance
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1250, now);
        filter.Q.setValueAtTime(3.5, now);

        oscGain1.gain.setValueAtTime(0, now);
        oscGain1.gain.linearRampToValueAtTime(0.7, now + 0.02);
        oscGain1.gain.exponentialRampToValueAtTime(0.3, now + 0.12);
        oscGain1.gain.linearRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(filter);
        filter.connect(oscGain1);
        oscGain1.connect(masterGain);

        osc1.start(now);
        osc1.stop(now + 0.24);

        // Second subtle body tone for fullness
        const osc2 = ctx.createOscillator();
        const oscGain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(340, now);
        osc2.frequency.exponentialRampToValueAtTime(220, now + 0.14);

        oscGain2.gain.setValueAtTime(0, now);
        oscGain2.gain.linearRampToValueAtTime(0.4, now + 0.03);
        oscGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc2.connect(oscGain2);
        oscGain2.connect(masterGain);

        osc2.start(now);
        osc2.stop(now + 0.22);
    } catch {
        // Silently fail if audio context is blocked
    }
}

/**
 * Play a sparkling sweet task completion chime
 */
export function playSuccessChime(volume: number = 0.5): void {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const times = [0, 0.06, 0.12, 0.18];

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + times[idx]);

            const noteVol = (volume * 0.3) / (idx === 3 ? 1 : 1.3);
            gain.gain.setValueAtTime(0, now + times[idx]);
            gain.gain.linearRampToValueAtTime(noteVol, now + times[idx] + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + times[idx] + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + times[idx]);
            osc.stop(now + times[idx] + 0.5);
        });
    } catch {
        // Silently fail if blocked
    }
}

/**
 * Play gentle bell chime when a focus session or break ends
 */
export function playTimerDoneAlarm(volume: number = 0.5): void {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        // Two-tone soothing temple bell
        const chords = [
            { f: 587.33, t: 0 },    // D5
            { f: 880.00, t: 0.15 }, // A5
            { f: 1174.66, t: 0.3 }  // D6
        ];

        chords.forEach(({ f, t }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + t);

            const v = volume * 0.4;
            gain.gain.setValueAtTime(0, now + t);
            gain.gain.linearRampToValueAtTime(v, now + t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.9);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + t);
            osc.stop(now + t + 1.0);
        });
    } catch {
        // Silently fail if blocked
    }
}

/**
 * Play subtle soft click
 */
export function playSoftClick(volume: number = 0.3): void {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

        gain.gain.setValueAtTime(volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    } catch {
        // Silently fail
    }
}

