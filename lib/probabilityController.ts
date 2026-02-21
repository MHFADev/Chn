import { Card, GameState } from './types';

/**
 * Controller for determining when drawing a card results in a Global Chaos card.
 * Global Draw Chaos Requirements:
 * - +100 Global (10% spawn)
 * - +200 Global (5% spawn)
 * - +300 Global (2% spawn, ultra rare)
 * - Cannot be drawn/played in first 5 turns.
 */
export function drawCardWithProbability(state: GameState, baseDeck: Card[]): Card {
    // If we are in the early game (first 5 turns), no global chaos can spawn
    if (state.turnCount <= 5) {
        return popFromDeck(baseDeck);
    }

    // Draw probability logic
    const rand = Math.random() * 100; // 0 to 100

    // +300 - 2%
    if (rand < 2) {
        return { id: crypto.randomUUID(), type: 'global_+300', color: 'wild' };
    }
    // +200 - 5% (starts at 2, ends at 7)
    if (rand < 7) {
        return { id: crypto.randomUUID(), type: 'global_+200', color: 'wild' };
    }
    // +100 - 10% (starts at 7, ends at 17)
    if (rand < 17) {
        return { id: crypto.randomUUID(), type: 'global_+100', color: 'wild' };
    }

    // Otherwise, normal draw
    return popFromDeck(baseDeck);
}

/**
 * Helper to safely pop a card from deck, if deck is empty, we would need to reshuffle discard pile.
 * For now, this just pops and if empty, we assume the gameEngine handles deck reshuffling first.
 */
function popFromDeck(deck: Card[]): Card {
    const card = deck.pop();
    if (!card) {
        // Fallback card if empty and not reshuffled (error case)
        return { id: crypto.randomUUID(), color: 'red', type: 'number', value: 0 };
    }
    return card;
}
