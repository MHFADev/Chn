import type { NextApiRequest, NextApiResponse } from 'next';
import { gameStateStore, MAX_PLAYERS_PER_ROOM } from './inMemoryStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { roomId, playerName } = req.body;

    if (!roomId || !playerName) {
        return res.status(400).json({ error: 'roomId and playerName are required' });
    }

    const state = gameStateStore.get(roomId.toUpperCase());

    if (!state) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (state.status !== 'waiting') {
        return res.status(403).json({ error: 'Game has already started' });
    }

    if (state.players.length >= MAX_PLAYERS_PER_ROOM) {
        return res.status(403).json({ error: 'Room is full' });
    }

    const newPlayer = {
        id: crypto.randomUUID(),
        name: playerName,
        hand: [],
        isAI: false,
        connected: true,
    };

    state.players.push(newPlayer);

    res.status(200).json({
        roomId: state.roomId,
        playerId: newPlayer.id,
        state
    });
}
