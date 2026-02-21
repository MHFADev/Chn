import { ActiveStack, Card, GameState, Player } from './types';

export class StackResolver {
    /**
     * Processes a played card onto an active stack (if any).
     * Calculates the new total draw amount.
     */
    static addCardToStack(state: GameState, card: Card, player: Player): void {
        const drawAmount = this.getDrawAmount(card.type);

        if (drawAmount > 0) {
            if (!state.activeStack) {
                state.activeStack = {
                    cards: [],
                    totalDraw: 0,
                    targets: [],
                };
            }

            state.activeStack.cards.push(card);
            state.activeStack.totalDraw += drawAmount;

            // If it's a global chaos, all other players are targets.
            if (card.type.startsWith('global_')) {
                state.globalCooldown = 1; // cooldown active
                state.activeStack.targets = state.players
                    .map(p => p.id)
                    .filter(id => id !== player.id); // everyone except the person who played it
            } else {
                // Standard draw like +2, +20, +30
                const nextPlayer = this.getNextPlayerIndex(state);
                state.activeStack.targets = [state.players[nextPlayer].id];
            }
        }
    }

    /**
     * Evaluates the current active stack. 
     * If a target cannot respond (e.g., they don't have a stackable card or chose to draw),
     * they absorb the penalty.
     */
    static resolveStack(state: GameState, targetPlayerId: string): number {
        if (!state.activeStack) return 0;

        const penalty = state.activeStack.totalDraw;

        // Remove the player from targets
        state.activeStack.targets = state.activeStack.targets.filter(id => id !== targetPlayerId);

        // If no targets left, clear the stack
        if (state.activeStack.targets.length === 0) {
            state.activeStack = null;
        }

        return penalty;
    }

    static getDrawAmount(type: string): number {
        switch (type) {
            case '+2': return 2;
            case '+20': return 20;
            case '+30': return 30;
            case 'global_+100': return 100;
            case 'global_+200': return 200;
            case 'global_+300': return 300;
            default: return 0;
        }
    }

    static isStackable(currentStackTopCard: Card, nextCard: Card): boolean {
        const currentDraw = this.getDrawAmount(currentStackTopCard.type);
        const nextDraw = this.getDrawAmount(nextCard.type);

        // Must be equal or greater draw amount to stack, or 'reflect'
        if (nextCard.type === 'reflect') return true;
        if (nextDraw >= currentDraw && nextDraw > 0) return true;

        return false;
    }

    private static getNextPlayerIndex(state: GameState): number {
        let nextIdx = state.turnIndex + state.direction;
        if (nextIdx >= state.players.length) nextIdx = 0;
        if (nextIdx < 0) nextIdx = state.players.length - 1;
        return nextIdx;
    }
}
