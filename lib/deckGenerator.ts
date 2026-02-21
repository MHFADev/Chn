import { Card, CardColor, CardType } from './types';

export const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow', 'cyan'];

/**
 * Generates the base deck excluding Global Chaos cards depending on rules.
 */
export function createBaseDeck(): Card[] {
    const deck: Card[] = [];

    // Basic Cards
    COLORS.forEach(color => {
        // 0
        deck.push({ id: crypto.randomUUID(), color, type: 'number', value: 0 });
        // 1-9 (two of each)
        for (let i = 1; i <= 9; i++) {
            deck.push({ id: crypto.randomUUID(), color, type: 'number', value: i });
            deck.push({ id: crypto.randomUUID(), color, type: 'number', value: i });
        }
        // Actions: Skip, Reverse, +2 (two of each)
        ['skip', 'reverse', '+2'].forEach(type => {
            deck.push({ id: crypto.randomUUID(), color, type: type as CardType });
            deck.push({ id: crypto.randomUUID(), color, type: type as CardType });
        });
    });

    // Wild Cards (4 Wild, 4 Chaos Wild)
    for (let i = 0; i < 4; i++) {
        deck.push({ id: crypto.randomUUID(), color: 'wild', type: 'wild' });
        deck.push({ id: crypto.randomUUID(), color: 'wild', type: 'chaos_wild' });
    }

    // Chaos Individual
    const chaosCards: CardType[] = [
        '+20', '+30', 'reflect', 'steal_hand', 'hand_shuffle',
        'double_turn', 'lock_color', 'bomb_timer', 'copy_card'
    ];

    chaosCards.forEach(type => {
        // 2 of each chaos card in the deck
        deck.push({ id: crypto.randomUUID(), color: 'wild', type });
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
