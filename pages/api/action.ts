import type { NextApiRequest, NextApiResponse } from 'next';
import { gameStateStore } from './inMemoryStore';
import { GameEngine } from '../../lib/gameEngine';
import { StackResolver } from '../../lib/stackResolver';
import { drawCardWithProbability } from '../../lib/probabilityController';
import { dealStartingHands } from '../../lib/deckGenerator';

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

    if (state.status !== 'playing') {
        return res.status(400).json({ error: 'Game is not active' });
    }

    if (state.turnIndex !== playerIndex) {
        return res.status(403).json({ error: 'Not your turn' });
    }

    state.turnStartTime = Date.now(); // Reset timer on action

    if (action === 'play') {
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return res.status(400).json({ error: 'Card not in hand' });
        const card = player.hand[cardIndex];

        if (!GameEngine.isValidPlay(state, card, player)) {
            return res.status(400).json({ error: 'Invalid move' });
        }

        player.hand.splice(cardIndex, 1);
        state.discardPile.push(card);

        StackResolver.addCardToStack(state, card, player);
        GameEngine.applyCardEffect(state, card, player);

        if (color) state.lockedColor = color; // For wild cards
        else if (card.color !== 'wild') state.lockedColor = null;

        state.turnCount++;
        state.turnIndex = GameEngine.getNextTurnIndex(state);
        state.lastAction = `${player.name} played ${card.color} ${card.type}`;

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
                player.hand.push(drawCardWithProbability(state, state.deck));
            }
            state.lastAction = `${player.name} drew ${amount} cards from stack`;
        } else {
            const card = drawCardWithProbability(state, state.deck);
            player.hand.push(card);
            state.lastAction = `${player.name} drew a card`;
        }

        state.turnCount++;
        state.turnIndex = GameEngine.getNextTurnIndex(state);
        return res.status(200).json(state);
    }

    return res.status(400).json({ error: 'Unknown action' });
}
