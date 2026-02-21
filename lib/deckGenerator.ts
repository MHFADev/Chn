import { Card, CardColor, CardType } from './types';

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow', 'cyan'];

/**
 * Generates the base deck according to the new ratio rules:
 * - 50% Standard (Numbers, Actions, Wilds)
 * - 40% Normal Draws (+2, +4, +6)
 * - 10% Abnormal Draws (+20, +60, +100, +200)
 */
export function createBaseDeck(): Card[] {
    const deck: Card[] = [];

    const getSecondary = () => {
        if (Math.random() < 0.3) {
            const actions: ('skip' | 'reverse' | 'wild')[] = ['skip', 'reverse', 'wild'];
            return actions[Math.floor(Math.random() * actions.length)];
        }
        return undefined;
    };

    // --- 50% STANDARD CARDS (approx 60 cards) ---
    COLORS.forEach(color => {
        // 10 Numbers (0-9) per color = 40 cards
        for (let i = 0; i <= 9; i++) {
            deck.push({ id: crypto.randomUUID(), color, type: 'number', value: i });
        }
        // Actions (2 Skip, 2 Reverse per color) = 16 cards
        ['skip', 'reverse'].forEach(type => {
            deck.push({ id: crypto.randomUUID(), color, type: type as CardType });
            deck.push({ id: crypto.randomUUID(), color, type: type as CardType });
        });
    });
    // 4 pure wilds = 4 cards
    for (let i = 0; i < 4; i++) { deck.push({ id: crypto.randomUUID(), color: 'wild', type: 'wild' }); }
    // Total Standard = 60 cards.

    // --- 40% NORMAL DRAWS (approx 48 cards) ---
    // (+2, +4, +6) -> 16 of each = 48 cards
    COLORS.forEach(color => {
        // We need 16 cards per type, spread across 4 or 5 colors. 
        // We have 5 colors, so 3 of each per color = 15 cards per type. Close enough.
        ['+2', '+4', '+6'].forEach(type => {
            for (let i = 0; i < 3; i++) {
                deck.push({ id: crypto.randomUUID(), color, type: type as CardType, secondaryAction: getSecondary() });
            }
        });
    }); // Total Normal = 45 cards.

    // --- 10% ABNORMAL DRAWS (approx 12 cards) ---
    // All abnormal are 'wild' color for maximum chaos.
    for (let i = 0; i < 4; i++) { deck.push({ id: crypto.randomUUID(), color: 'wild', type: '+20', secondaryAction: getSecondary() }); }
    for (let i = 0; i < 4; i++) { deck.push({ id: crypto.randomUUID(), color: 'wild', type: '+60', secondaryAction: getSecondary() }); }
    for (let i = 0; i < 2; i++) { deck.push({ id: crypto.randomUUID(), color: 'wild', type: '+100', secondaryAction: getSecondary() }); }
    for (let i = 0; i < 2; i++) { deck.push({ id: crypto.randomUUID(), color: 'wild', type: '+200', secondaryAction: getSecondary() }); }
    // Total Abnormal = 12 cards.

    // --- UNIQUE CHAOS CARDS (Additional Flavour) ---
    // 1 of each of these cool mechanics just to keep the game fresh.
    const chaosCards: CardType[] = ['reflect', 'steal_hand', 'hand_shuffle', 'double_turn', 'lock_color', 'bomb_timer', 'copy_card', 'chaos_wild'];
    chaosCards.forEach(type => {
        deck.push({ id: crypto.randomUUID(), color: 'wild', type });
    });

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
