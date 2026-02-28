import { Card, CardColor, CardType, RoomSettings } from './types';

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow', 'cyan'];

/**
 * Generates the base deck according to the new ratio rules:
 * - 50% Standard (Numbers, Actions, Wilds)
 * - 40% Normal Draws (+2, +4, +6)
 * - 10% Abnormal Draws (+20, +60, +100, +200)
 */
export function createBaseDeck(settings?: RoomSettings): Card[] {
    const deck: Card[] = [];

    const getSecondary = () => {
        if (Math.random() < 0.3) {
            const actions: ('skip' | 'reverse' | 'wild')[] = ['skip', 'reverse', 'wild'];
            return actions[Math.floor(Math.random() * actions.length)];
        }
        return undefined;
    };

    const allowedColors = settings?.allowedColors && settings.allowedColors.length > 0 ? settings.allowedColors : COLORS;
    const enableNumbers = settings?.enableNumbers ?? true;
    const enableActions = settings?.enableActions ?? true;
    const enableNormalDraws = settings?.enableNormalDraws ?? true;
    const enableAbnormalDraws = settings?.enableAbnormalDraws ?? true;
    const enableChaosCards = settings?.enableChaosCards ?? true;

    if (enableNumbers || enableActions) {
        allowedColors.forEach(color => {
            if (enableNumbers) {
                for (let i = 0; i <= 9; i++) {
                    deck.push({ id: crypto.randomUUID(), color, type: 'number', value: i });
                }
            }
            if (enableActions) {
                ['skip', 'reverse'].forEach(type => {
                    deck.push({ id: crypto.randomUUID(), color, type: type as CardType });
                    deck.push({ id: crypto.randomUUID(), color, type: type as CardType });
                });
            }
        });
        for (let i = 0; i < 4; i++) { deck.push({ id: crypto.randomUUID(), color: 'wild', type: 'wild' }); }
    }

    if (enableNormalDraws) {
        const normalTypes: ('+2' | '+4' | '+6')[] = ['+2', '+4', '+6'];
        const allowedNormal = settings?.allowedNormalDraws && settings.allowedNormalDraws.length > 0
            ? settings.allowedNormalDraws
            : normalTypes;
        allowedColors.forEach(color => {
            allowedNormal.forEach(type => {
                for (let i = 0; i < 3; i++) {
                    deck.push({ id: crypto.randomUUID(), color, type: type as CardType, secondaryAction: getSecondary() });
                }
            });
        });
    }

    if (enableAbnormalDraws) {
        const abnormalTypes: ('+20' | '+60' | '+100' | '+200' | '+300')[] = ['+20', '+60', '+100', '+200', '+300'];
        const allowedAbnormal = settings?.allowedAbnormalDraws && settings.allowedAbnormalDraws.length > 0
            ? settings.allowedAbnormalDraws
            : abnormalTypes;
        const counts: Record<string, number> = { '+20': 4, '+60': 4, '+100': 1, '+200': 1, '+300': 1 };
        for (const t of allowedAbnormal) {
            const n = counts[t] ?? 2;
            for (let i = 0; i < n; i++) {
                deck.push({ id: crypto.randomUUID(), color: 'wild', type: t as CardType, secondaryAction: getSecondary() });
            }
        }
    }

    if (enableChaosCards) {
        const chaosCards: CardType[] = ['reflect', 'steal_hand', 'hand_shuffle', 'double_turn', 'lock_color', 'bomb_timer', 'copy_card', 'chaos_wild'];
        chaosCards.forEach(type => {
            deck.push({ id: crypto.randomUUID(), color: 'wild', type });
        });
    }

    return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

/**
 * Deals cards to players. Only deals basic/safe cards initially to avoid early overpower.
 */
export function dealStartingHands(deck: Card[], numPlayers: number, cardsPerPlayer = 7) {
    const hands: Card[][] = Array.from({ length: numPlayers }, () => []);

    // Filter out any crazy cards for the initial deal if necessary
    // Currently createBaseDeck contains chaos cards but no global chaos

    for (let i = 0; i < cardsPerPlayer; i++) {
        for (let p = 0; p < numPlayers; p++) {
            const card = deck.pop();
            if (card) hands[p].push(card);
        }
    }

    // Get first card that is a standard number to start the discard pile
    let firstCardIndex = deck.findIndex(c => c.type === 'number');
    if (firstCardIndex === -1) firstCardIndex = 0;

    const firstCard = deck.splice(firstCardIndex, 1)[0];

    return { hands, remainingDeck: deck, firstCard };
}
