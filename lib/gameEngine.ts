import { ActiveStack, Card, GameState, Player, CardColor } from './types';
import { StackResolver } from './stackResolver';

export class GameEngine {
    /**
     * Validates if a card can be played by normal UNO rules and Chaos conditions.
     */
    static isValidPlay(state: GameState, cardToPlay: Card, player: Player): boolean {
        const topCard = state.discardPile[state.discardPile.length - 1];

        // 1. Stack Validation
        if (state.activeStack) {
            if (!StackResolver.isStackable(topCard, cardToPlay)) {
                return false;
            }
        }

        // 2. Global Chaos Restrictions (Turn Count & Hand Size)
        if (cardToPlay.type.startsWith('global_')) {
            if (state.turnCount <= 5) return false;
            if (player.hand.length <= 3) return false;
            if (state.globalCooldown > 0) return false;
        }

        // 3. Normal UNO logic
        if (cardToPlay.color === 'wild') return true;

        if (state.lockedColor && cardToPlay.color !== state.lockedColor) return false;

        // Check color or type match
        if (topCard.color === cardToPlay.color || topCard.type === cardToPlay.type) {
            return true;
        }

        // If top card was wild, color might have been changed, handled by lockedColor
        // If we reach here and colors don't match, invalid
        return false;
    }

    static getNextTurnIndex(state: GameState): number {
        let nextIdx = state.turnIndex + state.direction;
        if (nextIdx >= state.players.length) nextIdx = 0;
        if (nextIdx < 0) nextIdx = state.players.length - 1;
        return nextIdx;
    }

    static applyCardEffect(state: GameState, card: Card, player: Player): void {
        const actionsToProcess = [card.type];
        if (card.secondaryAction) {
            actionsToProcess.push(card.secondaryAction);
        }

        actionsToProcess.forEach(action => {
            switch (action) {
                case 'skip':
                    state.turnIndex = this.getNextTurnIndex(state); // Skips next
                    break;
                case 'reverse':
                    state.direction = (state.direction === 1 ? -1 : 1) as 1 | -1;
                    if (state.players.length === 2) {
                        state.turnIndex = this.getNextTurnIndex(state); // Reverse acts as skip in 2 player
                    }
                    break;
                case 'double_turn':
                    // Normally turn advances at end of action. So we set a flag.
                    // For simplicity, we just rewind turnIndex here so next step keeps it on same player
                    state.direction = (state.direction === 1 ? -1 : 1) as 1 | -1;
                    state.turnIndex = this.getNextTurnIndex(state);
                    state.direction = (state.direction === 1 ? -1 : 1) as 1 | -1;
                    break;
                case 'hand_shuffle':
                    // Shuffle all players' hands together
                    const allCards = state.players.flatMap(p => p.hand);
                    // Fisher-Yates shuffle
                    for (let i = allCards.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
                    }
                    // Deal evenly
                    let pIdx = 0;
                    state.players.forEach(p => p.hand = []);
                    for (const c of allCards) {
                        state.players[pIdx].hand.push(c);
                        pIdx = (pIdx + 1) % state.players.length;
                    }
                    break;
                // Add complex logic as needed for steal_hand, lock_color, bomb_timer
            }
        });

        // 10% Self-Draw Penalty for Abnormal Draw Cards (+20, +60, +100, +200)
        const abnormalDraws = ['+20', '+60', '+100', '+200'];
        if (abnormalDraws.includes(card.type)) {
            const penaltyPercent = 0.1;
            const drawAmount = StackResolver.getDrawAmount(card.type) * penaltyPercent;

            for (let i = 0; i < drawAmount; i++) {
                if (state.deck.length > 0) {
                    const penaltyCard = state.deck.pop();
                    if (penaltyCard) player.hand.push(penaltyCard);
                }
            }
        }

        // Decrement globals cooldown if active
        if (state.globalCooldown > 0) state.globalCooldown--;
    }
}
