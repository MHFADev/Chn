export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'cyan' | 'wild';

export type CardType =
    | 'number'
    | 'skip' | 'reverse' | '+2' | 'wild'
    // Chaos Individual
    | '+20' | '+30' | 'reflect' | 'steal_hand' | 'hand_shuffle'
    | 'double_turn' | 'lock_color' | 'bomb_timer' | 'copy_card' | 'chaos_wild'
    // Global Draw Chaos
    | 'global_+100' | 'global_+200' | 'global_+300';

export interface Card {
    id: string; // unique identifier per instance
    type: CardType;
    color: CardColor;
    value?: number; // for number cards
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
    winnerId: string | null;
    lastAction?: string;
    lockedColor?: CardColor | null;
}
