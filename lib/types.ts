export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'cyan' | 'wild';

export type CardType =
    | 'number'
    | 'skip' | 'reverse' | 'wild'
    // Normal Draws (40%)
    | '+2' | '+4' | '+6'
    // Abnormal Draws (10%)
    | '+20' | '+60' | '+100' | '+200'
    // Unique Individual Chaos
    | 'reflect' | 'steal_hand' | 'hand_shuffle'
    | 'double_turn' | 'lock_color' | 'bomb_timer' | 'copy_card' | 'chaos_wild';

export interface Card {
    id: string; // unique identifier per instance
    type: CardType;
    color: CardColor;
    value?: number; // for number cards
    secondaryAction?: 'skip' | 'reverse' | 'wild'; // Dual effect chance
}

export interface Player {
    id: string;
    name: string;
    hand: Card[];
    isAI: boolean;
    connected: boolean;
    disconnectTime?: number;
}

export interface ActiveStack {
    cards: Card[];
    totalDraw: number;
    targets: string[]; // player ids who need to draw
}

export interface RoomSettings {
    turnTimeLimit: number; // in seconds
}

export interface GameState {
    roomId: string;
    status: 'waiting' | 'playing' | 'finished';
    players: Player[];
    deck: Card[];
    discardPile: Card[];
    turnIndex: number; // Index in players array
    direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
    activeStack: ActiveStack | null;
    globalCooldown: number; // turns until next global can be played
    turnCount: number; // total turns taken so far, used for early overpower prevention
    turnStartTime: number; // timestamp
    settings: RoomSettings;
    winnerId: string | null;
    lastAction?: string;
    lockedColor?: CardColor | null;
}
