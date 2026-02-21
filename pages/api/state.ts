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
        // --- AI AUTO-PLAY DISABLED ---
        // if (now - state.turnStartTime > TURN_TIMEOUT_MS) {
        // ... AI logic removed based on user feedback to prevent auto-play in multiplayer.
        // }
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (safeState.players[pIdx] as any).hand = state.players[pIdx].hand;
        }
    }

    res.status(200).json(safeState);
}
