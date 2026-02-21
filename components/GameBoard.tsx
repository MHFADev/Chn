import React from 'react';
import { GameState, Card as CardType } from '../lib/types';
import { Card } from './Card';
import { motion } from 'framer-motion';

interface GameBoardProps {
    state: GameState;
    playerId: string;
    onDraw: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ state, playerId, onDraw }) => {
    const topDiscard = state.discardPile.length > 0
        ? state.discardPile[state.discardPile.length - 1]
        : null;

    const isMyTurn = state.players[state.turnIndex]?.id === playerId;
    const opponents = state.players.filter(p => p.id !== playerId);

    // Helper to get time remaining
    const timeRemaining = Math.max(0, 20 - Math.floor((Date.now() - state.turnStartTime) / 1000));

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-between p-4 relative z-0">

            {/* Opponents Area */}
            <div className="w-full flex justify-around p-4 h-32 mt-4 glass-panel max-w-6xl mx-auto">
                {opponents.map((p, i) => {
                    const isTurn = state.players[state.turnIndex]?.id === p.id;
                    return (
                        <div key={p.id} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${isTurn ? 'bg-white/20 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 opacity-70'}`}>
                            <span className="font-bold text-sm tracking-wider uppercase mb-1">{p.name} {p.isAI ? '(AI)' : ''}</span>
                            <div className="flex gap-2 items-center">
                                <span className="text-2xl">🎴</span>
                                <span className="font-mono text-xl">{p.hand.length || 0}</span>
                            </div>
                            {isTurn && <div className="text-xs text-neon-green animate-pulse mt-2">TURN START</div>}
                        </div>
                    )
                })}
            </div>

            {/* Center Area */}
            <div className="flex-1 w-full flex items-center justify-center gap-12 sm:gap-24 relative">
                {/* Active Stack Penalties */}
                {state.activeStack && state.activeStack.totalDraw > 0 && (
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-neon-red font-black text-2xl drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] z-20">
                        STACK: DRAW {state.activeStack.totalDraw}
                    </div>
                )}

                {/* Global Chaos Screen Shake */}
                {state.activeStack && state.activeStack.cards.length > 0 && state.activeStack.cards[state.activeStack.cards.length - 1].type.startsWith('global_') && (
                    <div className="absolute inset-0 pointer-events-none z-50 mix-blend-screen opacity-20 bg-red-500 animate-pulse transition-all duration-75" />
                )}

                {/* Deck Pile */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isMyTurn ? onDraw : undefined}
                    className={`w-36 h-52 rounded-xl border-2 border-white/20 bg-gradient-to-br from-gray-800 to-black shadow-2xl flex items-center justify-center cursor-pointer relative overflow-hidden group ${isMyTurn ? 'ring-4 ring-white/50 animate-pulse' : 'opacity-80'}`}
                >
                    <div className="absolute inset-2 border border-white/10 rounded-lg pointer-events-none" />
                    <span className="text-4xl opacity-50 font-black tracking-widest -rotate-45 group-hover:opacity-100 transition-opacity">CHAOS</span>
                    <div className="absolute bottom-2 right-2 text-xs font-mono text-white/50">{state.deck.length}</div>
                </motion.div>

                {/* Discard Pile */}
                <div className="relative w-36 h-52">
                    {topDiscard ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: Math.random() * 10 - 5 }}
                            transition={{ type: 'spring' }}
                            className="absolute inset-0 shadow-2xl"
                        >
                            <Card disabled={true} className="w-full h-full text-xl" card={topDiscard} />
                        </motion.div>
                    ) : (
                        <div className="w-full h-full rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center opacity-30 text-xs text-center p-2">
                            PLAY CARD HERE
                        </div>
                    )}

                    {/* Locked Color Indicator */}
                    {state.lockedColor && (
                        <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg border text-black
                ${state.lockedColor === 'red' ? 'bg-neon-red border-red-400' : ''}
                ${state.lockedColor === 'blue' ? 'bg-neon-blue border-blue-400' : ''}
                ${state.lockedColor === 'green' ? 'bg-neon-green border-green-400' : ''}
                ${state.lockedColor === 'yellow' ? 'bg-neon-yellow border-yellow-400' : ''}
              `}>
                            LOCKED: {state.lockedColor}
                        </div>
                    )}
                </div>
            </div>

            {/* Info / Turn Timer Tracker */}
            <div className="absolute bottom-60 right-8 flex flex-col gap-2 items-end z-10 pointer-events-none">
                <div className="px-4 py-2 glass-panel text-sm font-mono flex items-center gap-2">
                    <span className={`${timeRemaining < 6 ? 'text-neon-red animate-ping' : 'text-white/80'}`}>⏳ {timeRemaining}s</span>
                </div>
                <div className="px-4 py-1 glass-panel text-xs opacity-60">
                    TURN: {state.turnCount}
                </div>
                {state.globalCooldown > 0 && (
                    <div className="px-4 py-1 bg-white/10 rounded border border-red-500/50 text-red-400 text-xs">
                        NO GLOBALS ({state.globalCooldown})
                    </div>
                )}
            </div>

            {/* Action Logs */}
            {state.lastAction && (
                <div className="absolute top-[35%] w-full flex justify-center pointer-events-none z-10 mix-blend-lighten">
                    <motion.div
                        key={state.turnCount}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="px-6 py-2 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-sm font-medium tracking-wide shadow-2xl border border-white/10"
                    >
                        {state.lastAction}
                    </motion.div>
                </div>
            )}

        </div>
    );
};
