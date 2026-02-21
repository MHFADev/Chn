import { GameState } from '../../lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

// In a real serverless environment like Vercel, global variables are preserved
// across hot reloads and multiple invocations on the same lambda instance.
// This is sufficient for a small-scale (20 rooms limit) free-tier deployment,
// though a Redis store is recommended for true scaling.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = globalThis as any;

if (!globalAny.gameStateStore) {
    globalAny.gameStateStore = new Map<string, GameState>();
}

export const gameStateStore: Map<string, GameState> = globalAny.gameStateStore;

export const MAX_ROOMS = 20;
export const MAX_PLAYERS_PER_ROOM = 6;
export const TURN_TIMEOUT_MS = 20000; // 20 seconds

// Next.js expects files in pages/api to have a default export
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(404).json({ error: 'Not found' });
}
