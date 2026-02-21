import { zzfxP } from './zzfx';

// 30 Pre-configured ZZFX Sound Profiles for Chaos Global Card Game
export const Sounds = {
    // --- UI Interactions ---
    hover: [, 0.1, 800, 0.01, 0.01, 0.01, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Subtle click
    click: [, 0.1, 1200, 0.01, 0.05, 0.05, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Sharp click
    toggleON: [, 0.15, 600, 0.01, 0.05, 0.1, 0, 1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Pitch up
    toggleOFF: [, 0.15, 600, 0.01, 0.05, 0.1, 0, 1, -5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Pitch down
    error: [, 0.3, 100, 0.02, 0.1, 0.2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Deep buzz

    // --- Lobby & Game Flow ---
    joinRoom: [, , 400, 0.05, 0.1, 0.2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    playerJoined: [, , 900, 0.02, 0.05, 0.2, 1, 1.5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    gameStart: [, 0.5, 300, 0.1, 0.3, 0.5, 0, 2.5, 10, -1, 0, 0, 0, 0, 0, 0, 0.1, 1, 0.1, 0, 0], // Big chord build
    turnStart: [, 0.2, 600, 0.05, 0.1, 0.2, 1, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    yourTurn: [, 0.4, 800, 0.05, 0.15, 0.3, 0, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Bright chime

    // --- Card Handling ---
    drawStandard: [, 0.1, 300, 0.02, 0.05, 0.1, 2, 1, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 1, 0, 0, 0], // Paper slide
    drawMulti: [, 0.15, 350, 0.02, 0.1, 0.2, 2, 1, 0, 0, 0, 0, 0.05, 0.5, 0, 0, 0, 1, 0, 0, 0], // Multiple fast slides
    playStandard: [, 0.2, 400, 0.01, 0.05, 0.1, 3, 1, -1, 0, 0, 0, 0, 0.5, 0, 0, 0, 1, 0, 0, 0], // Thud
    playMulti: [, 0.3, 400, 0.01, 0.1, 0.2, 3, 1, -2, 0, 0, 0, 0.05, 0.5, 0, 0, 0, 1, 0, 0, 0], // Multiple thuds
    invalidPlay: [, 0.2, 150, 0.02, 0.1, 0.1, 3, 4, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Short buzz

    // --- Special Cards (Normal) ---
    skip: [, 0.3, 500, 0.05, 0.1, 0.2, 0, 1, 10, -5, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Swoosh
    reverse: [, 0.3, 400, 0.05, 0.1, 0.2, 1, 1, 5, -2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Reverse swoosh
    wildColor: [, 0.4, 600, 0.1, 0.2, 0.3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Magical shimmer
    draw2: [, 0.4, 200, 0.05, 0.2, 0.3, 2, 1, -2, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Heavier slide
    draw4: [, 0.5, 150, 0.05, 0.3, 0.5, 2, 1, -5, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0], // Dramatic heavy slide

    // --- Chaos & Global Cards ---
    chaosGlobalCall: [, 0.8, 100, 0.1, 0.5, 1, 3, 5, -10, -2, 0, 0, 0, 10, 0, 0, 0.2, 1, 0.5, 0, 0], // Massive explosion
    bombTimer: [, 0.6, 800, 0.01, 0.05, 0.1, 1, 1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 1, 0, 0, 0], // Ticking clock
    bombExplode: [, 1, 50, 0.1, 0.4, 1.5, 3, 10, -5, -3, 0, 0, 0, 20, 0, 0, 0.5, 1, 0.5, 0, 0], // Absolute nuke
    draw100: [, 1, 100, 0.2, 0.5, 2, 3, 5, -20, -5, 0, 0, 0, 15, 0, 0, 0, 1, 0, 0, 0], // Seismic rumble
    reflect: [, 0.6, 1200, 0.05, 0.1, 0.5, 1, 1, 20, 5, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // High pitched ricochet
    stealHand: [, 0.5, 400, 0.1, 0.2, 0.4, 0, 1, -10, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Sneaky swoop
    colorLock: [, 0.4, 500, 0.05, 0.2, 0.3, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Clank lock

    // --- Game End States ---
    win: [, 0.6, 500, 0.1, 0.5, 1, 0, 3, 5, 0, 0, 0, 0.1, 0, 0, 0, 0.1, 1, 0.2, 0, 0], // Triumphant arpeggio
    lose: [, 0.6, 200, 0.2, 0.5, 1, 1, 2, -10, -2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Sad trombone
    timeout: [, 0.5, 150, 0.05, 0.2, 0.5, 3, 1, -5, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0], // Time up buzzer
};

let masterVolume = 0.5;

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
