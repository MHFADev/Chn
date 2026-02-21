import type { NextApiRequest, NextApiResponse } from 'next';
import { gameStateStore, MAX_ROOMS } from './inMemoryStore';
import { createBaseDeck, dealStartingHands } from '../../lib/deckGenerator';
import { GameState, CardColor } from '../../lib/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (gameStateStore.size >= MAX_ROOMS) {
        return res.status(503).json({ error: 'Server is full, maximum rooms reached.' });
    }

    const { playerName, turnTimeLimit, settings: inputSettings } = req.body;
    if (!playerName) {
        return res.status(400).json({ error: 'playerName is required' });
    }

    // Default to 20 seconds if not provided
    const timerLimit = typeof turnTimeLimit === 'number' ? turnTimeLimit : 20;

    // Generate a 6-char room code
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const defaultSettings: {
        turnTimeLimit: number;
        enableNumbers: boolean;
        enableActions: boolean;
        enableNormalDraws: boolean;
        enableAbnormalDraws: boolean;
        enableChaosCards: boolean;
        allowedColors?: CardColor[];
        allowedNormalDraws: ('+2' | '+4' | '+6')[];
        allowedAbnormalDraws: ('+20' | '+60' | '+100' | '+200')[];
    } = {
        turnTimeLimit: timerLimit,
        enableNumbers: true,
        enableActions: true,
        enableNormalDraws: true,
        enableAbnormalDraws: true,
        enableChaosCards: true,
        allowedColors: undefined,
        allowedNormalDraws: ['+2', '+4', '+6'] as ('+2' | '+4' | '+6')[],
        allowedAbnormalDraws: ['+20', '+60', '+100', '+200'] as ('+20' | '+60' | '+100' | '+200')[]
    };

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const mergedSettings = { ...defaultSettings };
    if (inputSettings) {
        if (typeof inputSettings.turnTimeLimit === 'number') mergedSettings.turnTimeLimit = clamp(inputSettings.turnTimeLimit, 5, 120);
        if (typeof inputSettings.enableNumbers === 'boolean') mergedSettings.enableNumbers = inputSettings.enableNumbers;
        if (typeof inputSettings.enableActions === 'boolean') mergedSettings.enableActions = inputSettings.enableActions;
        if (typeof inputSettings.enableNormalDraws === 'boolean') mergedSettings.enableNormalDraws = inputSettings.enableNormalDraws;
        if (typeof inputSettings.enableAbnormalDraws === 'boolean') mergedSettings.enableAbnormalDraws = inputSettings.enableAbnormalDraws;
        if (typeof inputSettings.enableChaosCards === 'boolean') mergedSettings.enableChaosCards = inputSettings.enableChaosCards;
        if (Array.isArray(inputSettings.allowedColors)) {
            const valid: CardColor[] = (inputSettings.allowedColors as string[])
                .filter((c: string) => ['red','blue','green','yellow','cyan'].includes(c))
                .map(c => c as CardColor);
            mergedSettings.allowedColors = valid.length > 0 ? valid : undefined;
        }
        if (Array.isArray(inputSettings.allowedNormalDraws)) mergedSettings.allowedNormalDraws = inputSettings.allowedNormalDraws;
        if (Array.isArray(inputSettings.allowedAbnormalDraws)) mergedSettings.allowedAbnormalDraws = inputSettings.allowedAbnormalDraws;
    }

    const fullDeck = createBaseDeck(mergedSettings);

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
        settings: mergedSettings,
        winnerId: null,
    };

    gameStateStore.set(roomId, newState);

    res.status(200).json({
        roomId,
        playerId: newPlayer.id,
        state: newState
    });
}
