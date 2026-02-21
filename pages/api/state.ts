import type { NextApiRequest, NextApiResponse } from 'next';
import { gameStateStore, TURN_TIMEOUT_MS } from './inMemoryStore';
import { AIEngine } from '../../lib/aiEngine';
import { GameEngine } from '../../lib/gameEngine';
import { drawCard } from '../../lib/probabilityController';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const roomId = req.query.roomId as string;

    if (!roomId) {
        return res.status(400).json({ error: 'roomId is required' });
    }

    const state = gameStateStore.get(roomId.toUpperCase());

    if (!state) {
        return res.status(404).json({ error: 'Room not found' });
    }

    // Check Turn Timeout if playing
    if (state.status === 'playing') {
        const now = Date.now();
        if (now - state.turnStartTime > TURN_TIMEOUT_MS) {
            // Player timed out
            const currentPlayer = state.players[state.turnIndex];

            // Mark as disconnected after 1 timeout for simplicity, or just force AI move
            currentPlayer.connected = false;

            // Force AI takeover or auto-draw
            const move = AIEngine.getBestMove(state, currentPlayer);
            if (move) {
                // Play logic similar to action.ts
                // Remove card from hand
                currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== move.id);
                state.discardPile.push(move);
                GameEngine.applyCardEffect(state, move, currentPlayer);
                state.turnStartTime = Date.now();
                state.turnCount++;
                state.lastAction = `${currentPlayer.name} (AI) played ${move.color} ${move.type}`;
            } else {
                // Auto draw
                const drawn = drawCard(state);
                currentPlayer.hand.push(drawn);
                state.turnIndex = GameEngine.getNextTurnIndex(state);
                state.turnStartTime = Date.now();
                state.turnCount++;
                state.lastAction = `${currentPlayer.name} (AI) drew a card due to timeout`;
            }
        }
    }

    // Return the state. In a real app, you might want to strip other players' hands to prevent cheating on client side.
    const safeState = {
        ...state,
        players: state.players.map(p => ({
            ...p,
            handCount: p.hand.length,
            // Keep actual hand only for the requester (we need playerId from query for this, skip for now for simplicity, or accept playerId in query)
        }))
    };

    // If client passes playerId, send their hand properly
    const playerId = req.query.playerId as string;
    if (playerId) {
        const pIdx = safeState.players.findIndex(p => p.id === playerId);
        if (pIdx !== -1) {
            (safeState.players[pIdx] as any).hand = state.players[pIdx].hand;
        }
    }

    res.status(200).json(safeState);
}
