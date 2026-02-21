import { Card, GameState } from './types';
import { shuffleDeck } from './deckGenerator';

/**
 * Handles drawing a card from the deck.
 * If the deck is empty, it reshuffles the discard pile back into the deck,
 * enabling infinite drawing without a limit.
 */
export function drawCard(state: GameState): Card {
    // If deck is empty, reshuffle discard pile
    if (state.deck.length === 0) {
        if (state.discardPile.length > 1) {
            const topDiscard = state.discardPile.pop()!;
            state.deck = shuffleDeck([...state.discardPile]);
            state.discardPile = [topDiscard];
        }
    }

    return popFromDeck(state.deck);
}

/**
 * Helper to safely pop a card from deck.
 */
function popFromDeck(deck: Card[]): Card {
    const card = deck.pop();
    if (!card) {
        // Fallback card if empty and not reshuffled (error case)
        return { id: crypto.randomUUID(), color: 'wild', type: 'number', value: 0 };
    }
    return card;
}
