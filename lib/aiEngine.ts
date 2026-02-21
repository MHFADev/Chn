import { GameState, Card, Player } from './types';
import { GameEngine } from './gameEngine';

export class AIEngine {
    /**
     * Auto-plays for a disconnected player or AI bot
     * Returns a card to play or null to indicate drawing.
     */
    static getBestMove(state: GameState, aiPlayer: Player): Card | null {
        // Basic AI implementation
        // Find all valid cards
        const validCards = aiPlayer.hand.filter(card => GameEngine.isValidPlay(state, card, aiPlayer));

        if (validCards.length === 0) {
            return null; // Draw
        }

        // Prefer playing non-wild normal numbers first if available
        const normalCards = validCards.filter(c => c.type === 'number');
        if (normalCards.length > 0) {
            return normalCards[Math.floor(Math.random() * normalCards.length)];
        }

        // Otherwise play actions, saving global chaos for when player has few cards
        const safeCards = validCards.filter(c => !c.type.startsWith('global_'));
        if (safeCards.length > 0) {
            return safeCards[0];
        }

        // Desperation, play globals
        return validCards[0];
    }
}
