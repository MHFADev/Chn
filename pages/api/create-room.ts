import type { NextApiRequest, NextApiResponse } from 'next';
import { gameStateStore, MAX_ROOMS } from './inMemoryStore';
import { createBaseDeck, dealStartingHands } from '../../lib/deckGenerator';
import { GameState } from '../../lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (gameStateStore.size >= MAX_ROOMS) {
        return res.status(503).json({ error: 'Server is full, maximum rooms reached.' });
    }

    const { playerName } = req.body;
    if (!playerName) {
        return res.status(400).json({ error: 'playerName is required' });
    }

    // Generate a 6-char room code
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Initial deck and deal
    const fullDeck = createBaseDeck();

    // For a new room, we just create the state. Deal hands later when game starts, or deal immediately for 1 player (though game usually needs 2).
    // Let's hold off dealing until game 'status' switches to 'playing'.
    // Actually, to keep it simple, we can deal when someone hits "Start Game" or just deal initially and add more when players join.
    // Standard is to deal when "Start" is clicked. So we leave hands empty and deal on start.

    const newPlayer = {
        id: crypto.randomUUID(),
        name: playerName,
        hand: [],
        isAI: false,
        connected: true,
    };

    const newState: GameState = {
        roomId,
        status: 'waiting',
        players: [newPlayer],
        deck: fullDeck,
        discardPile: [],
        turnIndex: 0,
        direction: 1,
        activeStack: null,
        globalCooldown: 0,
        turnCount: 0,
        turnStartTime: Date.now(),
        winnerId: null,
    };

    gameStateStore.set(roomId, newState);

    res.status(200).json({
        roomId,
        playerId: newPlayer.id,
        state: newState
    });
}
