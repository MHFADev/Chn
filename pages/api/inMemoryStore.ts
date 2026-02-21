import { GameState } from '../../lib/types';

// In a real serverless environment like Vercel, global variables are preserved
// across hot reloads and multiple invocations on the same lambda instance.
// This is sufficient for a small-scale (20 rooms limit) free-tier deployment,
// though a Redis store is recommended for true scaling.

const globalAny = global as any;

if (!globalAny.gameStateStore) {
    globalAny.gameStateStore = new Map<string, GameState>();
}

export const gameStateStore: Map<string, GameState> = globalAny.gameStateStore;

export const MAX_ROOMS = 20;
export const MAX_PLAYERS_PER_ROOM = 6;
export const TURN_TIMEOUT_MS = 20000; // 20 seconds
