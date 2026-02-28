import type { NextApiRequest, NextApiResponse } from 'next';
import { gameStateStore } from './inMemoryStore';
import { GameEngine } from '../../lib/gameEngine';
import { StackResolver } from '../../lib/stackResolver';
import { drawCard } from '../../lib/probabilityController';
import { dealStartingHands, createBaseDeck } from '../../lib/deckGenerator';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { roomId, playerId, action, cardId, color } = req.body;

    const state = gameStateStore.get(roomId?.toUpperCase());
    if (!state) return res.status(404).json({ error: 'Room not found' });

    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return res.status(403).json({ error: 'Player not in room' });

    const player = state.players[playerIndex];
    player.connected = true; // Heartbeat update

    if (action === 'start_game') {
        if (state.status !== 'waiting') return res.status(400).json({ error: 'Already started' });
        if (state.players.length < 2) return res.status(400).json({ error: 'Need at least 2 players' });

        const { hands, firstCard } = dealStartingHands(state.deck, state.players.length);
        hands.forEach((hand, idx) => {
            state.players[idx].hand = hand;
        });
        state.discardPile.push(firstCard!);
        state.status = 'playing';
        state.turnStartTime = Date.now();
        state.lastAction = 'Game Started';
        return res.status(200).json(state);
    }

    if (action === 'update_settings') {
        if (state.status !== 'waiting') return res.status(400).json({ error: 'Cannot change settings after game starts' });
        const next = req.body.settings || {};
        const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
        state.settings.turnTimeLimit = clamp(typeof next.turnTimeLimit === 'number' ? next.turnTimeLimit : state.settings.turnTimeLimit, 5, 120);
        if (typeof next.enableNumbers === 'boolean') state.settings.enableNumbers = next.enableNumbers;
        if (typeof next.enableActions === 'boolean') state.settings.enableActions = next.enableActions;
        if (typeof next.enableNormalDraws === 'boolean') state.settings.enableNormalDraws = next.enableNormalDraws;
        if (typeof next.enableAbnormalDraws === 'boolean') state.settings.enableAbnormalDraws = next.enableAbnormalDraws;
        if (typeof next.enableChaosCards === 'boolean') state.settings.enableChaosCards = next.enableChaosCards;
        if (Array.isArray(next.allowedColors)) state.settings.allowedColors = next.allowedColors;
        if (Array.isArray(next.allowedNormalDraws)) state.settings.allowedNormalDraws = next.allowedNormalDraws;
        if (Array.isArray(next.allowedAbnormalDraws)) state.settings.allowedAbnormalDraws = next.allowedAbnormalDraws;
        state.deck = createBaseDeck(state.settings);
        state.lastAction = 'Room settings updated';
        return res.status(200).json(state);
    }

    if (state.status !== 'playing') {
        return res.status(400).json({ error: 'Game is not active' });
    }

    if (state.turnIndex !== playerIndex) {
        return res.status(403).json({ error: 'Not your turn' });
    }

    state.turnStartTime = Date.now();

    if (action === 'play') {
        // Multi-play combo support: accept cardIds array, fallback to single cardId
        const cardIds: string[] = req.body.cardIds || (cardId ? [cardId] : []);
        if (cardIds.length === 0) return res.status(400).json({ error: 'No cards provided' });

        // Ensure all cards are in hand
        const cardsToPlay = [];
        for (const id of cardIds) {
            const c = player.hand.find(cc => cc.id === id);
            if (!c) return res.status(400).json({ error: 'Card not in hand' });
            cardsToPlay.push(c);
        }

        // Validate multi-select combo: all selected cards must have the same value or type
        const firstCard = cardsToPlay[0];
        const isMatchingCombo = cardsToPlay.every(c =>
            (c.type === 'number' && firstCard.type === 'number' && c.value === firstCard.value) ||
            (c.type !== 'number' && c.type === firstCard.type)
        );
        if (!isMatchingCombo) {
            return res.status(400).json({ error: 'Selected cards do not form a valid combo' });
        }

        // Check if the primary card is valid to play on the board
        if (!GameEngine.isValidPlay(state, firstCard, player)) {
            return res.status(400).json({ error: 'Invalid move' });
        }

        // Play cards sequentially
        for (const card of cardsToPlay) {
            const idx = player.hand.findIndex(c => c.id === card.id);
            if (idx !== -1) player.hand.splice(idx, 1);
            state.discardPile.push(card);

            StackResolver.addCardToStack(state, card, player);
            GameEngine.applyCardEffect(state, card, player);
        }

        if (color) state.lockedColor = color; // For wild cards
        else if (firstCard.color !== 'wild') state.lockedColor = null;

        state.turnCount++;
        state.turnIndex = GameEngine.getNextTurnIndex(state);
        state.turnStartTime = Date.now();
        if (state.lockedColorRounds && state.lockedColorRounds > 0) {
            state.lockedColorRounds--;
            if (state.lockedColorRounds <= 0) state.lockedColor = null;
        }
        if (state.bomb) {
            state.bomb.countdown--;
            if (state.bomb.countdown <= 0) {
                const victim = state.players[state.turnIndex];
                for (let i = 0; i < state.bomb.penalty; i++) {
                    victim.hand.push(drawCard(state));
                }
                state.lastAction = `${victim.name} was hit by a bomb and drew ${state.bomb.penalty}!`;
                state.bomb = null;
            }
        }

        const cardTypeName = firstCard.type === 'number' ? firstCard.value : firstCard.type.toUpperCase();
        state.lastAction = `${player.name} played ${cardsToPlay.length > 1 ? cardsToPlay.length + 'x ' : ''}${cardTypeName}`;

        // Check win condition
        if (player.hand.length === 0) {
            state.status = 'finished';
            state.winnerId = player.id;
        }

        return res.status(200).json(state);
    }

    if (action === 'draw') {
        // Can only draw if not forced to resolve a stack, or if resolving stack fails (handled implicitly if they choose to draw)
        if (state.activeStack && state.activeStack.targets.includes(playerId)) {
            const amount = StackResolver.resolveStack(state, playerId);
            for (let i = 0; i < amount; i++) {
                player.hand.push(drawCard(state));
            }
            state.lastAction = `${player.name} drew ${amount} cards from stack`;
        } else {
            const card = drawCard(state);
            player.hand.push(card);
            state.lastAction = `${player.name} drew a card`;
        }

        state.turnCount++;
        state.turnIndex = GameEngine.getNextTurnIndex(state);
        state.turnStartTime = Date.now();
        if (state.lockedColorRounds && state.lockedColorRounds > 0) {
            state.lockedColorRounds--;
            if (state.lockedColorRounds <= 0) state.lockedColor = null;
        }
        if (state.bomb) {
            state.bomb.countdown--;
            if (state.bomb.countdown <= 0) {
                const victim = state.players[state.turnIndex];
                for (let i = 0; i < state.bomb.penalty; i++) {
                    victim.hand.push(drawCard(state));
                }
                state.lastAction = `${victim.name} was hit by a bomb and drew ${state.bomb.penalty}!`;
                state.bomb = null;
            }
        }
        return res.status(200).json(state);
    }

    return res.status(400).json({ error: 'Unknown action' });
}
