import { zzfxP } from './zzfx';
import { Howl } from 'howler';

// 30 Pre-configured ZZFX Sound Profiles for Chaos Global Card Game
export const Sounds = {
    // --- UI Interactions ---
    hover: [, 0.05, 500, 0.02, 0.08, 0.12, 0, 0.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    click: [, 0.06, 900, 0.02, 0.08, 0.12, 0, 0.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    toggleON: [, 0.15, 600, 0.01, 0.05, 0.1, 0, 1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Pitch up
    toggleOFF: [, 0.15, 600, 0.01, 0.05, 0.1, 0, 1, -5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Pitch down
    error: [, 0.25, 120, 0.03, 0.08, 0.18, 0, 0.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],

    // --- Lobby & Game Flow ---
    joinRoom: [, , 400, 0.05, 0.1, 0.2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    playerJoined: [, , 900, 0.02, 0.05, 0.2, 1, 1.5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    gameStart: [, 0.35, 280, 0.08, 0.25, 0.45, 0, 2, 8, -1, 0, 0, 0, 0, 0, 0, 0.08, 1, 0.1, 0, 0],
    turnStart: [, 0.2, 600, 0.05, 0.1, 0.2, 1, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    yourTurn: [, 0.3, 650, 0.04, 0.12, 0.25, 0, 1.5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],

    // --- Card Handling ---
    drawStandard: [, 0.08, 260, 0.03, 0.08, 0.15, 1, 0.8, 0, 0, 0, 0, 0, 0.4, 0, 0, 0, 1, 0, 0, 0],
    drawMulti: [, 0.1, 300, 0.03, 0.1, 0.18, 1, 0.8, 0, 0, 0, 0, 0.04, 0.4, 0, 0, 0, 1, 0, 0, 0],
    playStandard: [, 0.15, 350, 0.02, 0.08, 0.15, 1, 0.8, -1, 0, 0, 0, 0, 0.4, 0, 0, 0, 1, 0, 0, 0],
    playMulti: [, 0.2, 340, 0.02, 0.1, 0.2, 1, 0.8, -2, 0, 0, 0, 0.04, 0.4, 0, 0, 0, 1, 0, 0, 0],
    invalidPlay: [, 0.12, 180, 0.03, 0.08, 0.15, 0, 0.6, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 1, 0, 0, 0],

    // --- Special Cards (Normal) ---
    skip: [, 0.2, 420, 0.04, 0.1, 0.18, 0, 0.9, 8, -4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    reverse: [, 0.22, 360, 0.04, 0.1, 0.18, 0, 0.9, 4, -2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    wildColor: [, 0.3, 520, 0.08, 0.22, 0.35, 0, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    draw2: [, 0.3, 180, 0.05, 0.18, 0.28, 1, 0.9, -2, 0, 0, 0, 0, 0.8, 0, 0, 0, 1, 0, 0, 0],
    draw4: [, 0.35, 140, 0.06, 0.22, 0.4, 1, 0.9, -4, 0, 0, 0, 0, 1.2, 0, 0, 0, 1, 0, 0, 0],

    // --- Chaos & Global Cards ---
    chaosGlobalCall: [, 0.5, 120, 0.08, 0.35, 0.8, 0, 1.5, -6, -2, 0, 0, 0, 6, 0, 0, 0.15, 1, 0.4, 0, 0],
    bombTimer: [, 0.3, 500, 0.02, 0.08, 0.12, 0, 0.8, 0, 0, 0, 0, 0.08, 0, 0, 0, 0, 1, 0, 0, 0],
    bombExplode: [, 0.6, 60, 0.1, 0.35, 1.2, 0, 2, -4, -3, 0, 0, 0, 10, 0, 0, 0.4, 1, 0.4, 0, 0],
    draw100: [, 0.6, 120, 0.15, 0.4, 1.8, 0, 1.2, -10, -5, 0, 0, 0, 8, 0, 0, 0.3, 1, 0.3, 0, 0],
    reflect: [, 0.4, 700, 0.05, 0.12, 0.35, 0, 0.8, 10, 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    stealHand: [, 0.35, 360, 0.08, 0.22, 0.35, 0, 0.8, -8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    colorLock: [, 0.3, 420, 0.06, 0.2, 0.3, 0, 0.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],

    // --- Game End States ---
    win: [, 0.45, 420, 0.08, 0.4, 0.8, 0, 2.2, 4, 0, 0, 0, 0.08, 0, 0, 0, 0.1, 1, 0.18, 0, 0],
    lose: [, 0.45, 180, 0.18, 0.4, 0.8, 0, 1.2, -8, -2, 0, 0, 0, 0, 0, 0, 0, 1, 0.2, 0, 0],
    timeout: [, 0.4, 160, 0.06, 0.22, 0.45, 0, 1, -4, 0, 0, 0, 0, 1.5, 0, 0, 0, 1, 0, 0, 0],
};

let masterVolume = 0.15;
let bgEnabled = false;
let bgVolume = 0.06;
let bgHowl: Howl | null = null;

export const playSound = (soundName: keyof typeof Sounds) => {
    if (typeof window === 'undefined') return;
    try {
        const soundParams = Sounds[soundName];
        if (soundParams) {
            // Apply master volume to first parameter
            const modifiedParams = [...soundParams];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            modifiedParams[0] = (modifiedParams[0] || 1) * masterVolume;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            zzfxP(...modifiedParams);
        }
    } catch (e) {
        console.error("Audio block", e);
    }
}

export const setMasterVolume = (vol: number) => {
    masterVolume = Math.max(0, Math.min(1, vol));
}
export const getMasterVolume = () => masterVolume;

export const startBackgroundChill = () => {
    if (typeof window === 'undefined') return;
    if (bgEnabled) return;
    if (!bgHowl) {
        bgHowl = new Howl({
            src: ['/bg.mp3'],
            loop: true,
            volume: bgVolume
        });
    }
    bgHowl.play();
    bgEnabled = true;
};

export const stopBackgroundChill = () => {
    if (!bgEnabled) return;
    if (bgHowl) {
        bgHowl.stop();
    }
    bgEnabled = false;
};

export const setBackgroundVolume = (vol: number) => {
    bgVolume = Math.max(0, Math.min(0.4, vol));
    if (bgHowl) bgHowl.volume(bgVolume);
};
export const getBackgroundVolume = () => bgVolume;
export const isBackgroundEnabled = () => bgEnabled;
