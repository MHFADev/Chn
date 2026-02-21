import type { NextApiRequest, NextApiResponse } from 'next';
import { gameStateStore } from './inMemoryStore';
import { GameEngine } from '../../lib/gameEngine';
import { StackResolver } from '../../lib/stackResolver';
import { drawCard } from '../../lib/probabilityController';
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

        let cardTypeName = firstCard.type === 'number' ? firstCard.value : firstCard.type.toUpperCase();
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
        return res.status(200).json(state);
    }

    return res.status(400).json({ error: 'Unknown action' });
}
