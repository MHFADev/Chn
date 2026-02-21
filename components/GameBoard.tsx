import React from 'react';
import { GameState, Card as CardType } from '../lib/types';
import { Card } from './Card';
import { motion } from 'framer-motion';
import { Cpu, User } from 'lucide-react';

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

    const timeRemaining = Math.max(0, 20 - Math.floor((Date.now() - state.turnStartTime) / 1000));

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-between p-6 relative z-0">

            {/* Opponents Area */}
            <div className="w-full flex justify-around p-4 h-32 mt-4 glass-panel max-w-5xl mx-auto">
                {opponents.map((p, i) => {
                    const isTurn = state.players[state.turnIndex]?.id === p.id;
                    return (
                        <div key={p.id} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border ${isTurn ? 'bg-zinc-800 border-zinc-700 shadow-sm scale-105' : 'bg-transparent border-transparent opacity-60'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {p.isAI ? <Cpu size={14} className="text-zinc-500" /> : <User size={14} className="text-zinc-500" />}
                                <span className="font-bold text-xs tracking-widest uppercase text-zinc-300">{p.name}</span>
                            </div>
                            <div className="flex gap-2 items-center bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">CARDS</span>
                                <span className="font-mono text-sm text-zinc-200">{p.hand.length || 0}</span>
                            </div>
                            {isTurn && <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-3">Thinking...</div>}
                        </div>
                    )
                })}
            </div>

            {/* Center Area */}
            <div className="flex-1 w-full flex items-center justify-center gap-16 sm:gap-32 relative py-12">
                {/* Active Stack Penalties */}
                {state.activeStack && state.activeStack.totalDraw > 0 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-2 rounded-full font-bold text-sm tracking-widest z-20 shadow-sm">
                        STACK DRAW: +{state.activeStack.totalDraw}
                    </div>
                )}

                {/* Deck Pile */}
                <motion.div
                    whileHover={isMyTurn ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isMyTurn ? { scale: 0.98 } : {}}
                    onClick={isMyTurn ? onDraw : undefined}
                    className={`w-[100px] h-[150px] rounded-xl border border-zinc-700 bg-zinc-900 shadow-md flex items-center justify-center cursor-pointer relative overflow-hidden group ${isMyTurn ? 'ring-2 ring-zinc-500 ring-offset-4 ring-offset-zinc-950 animate-soft-float' : 'opacity-70'}`}
                >
                    {/* Subtle pattern for the deck back */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, #000 25%, #000 75%, #fff 75%, #fff)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
                    <span className="text-xl opacity-60 font-black tracking-widest -rotate-90 text-zinc-300 group-hover:opacity-100 transition-opacity drop-shadow-md">CHAOS</span>
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-400 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800">{state.deck.length}</div>
                </motion.div>

                {/* Discard Pile */}
                <div className="relative w-[100px] h-[150px]">
                    {topDiscard ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, rotate: Math.random() * 6 - 3 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="absolute inset-0 z-10"
                        >
                            <Card disabled={true} className="w-full h-full shadow-lg" card={topDiscard} />
                        </motion.div>
                    ) : (
                        <div className="w-full h-full rounded-xl border border-dashed border-zinc-700 flex flex-col items-center justify-center opacity-50 text-[10px] font-bold uppercase tracking-widest text-center px-4 text-zinc-500">
                            <div>DISCARD</div><div>PILE</div>
                        </div>
                    )}

                    {/* Locked Color Indicator */}
                    {state.lockedColor && (
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-zinc-900 text-zinc-300 border-zinc-700 flex items-center gap-2 shadow-md whitespace-nowrap z-20">
                            <div className={`w-2 h-2 rounded-full 
                  ${state.lockedColor === 'red' ? 'bg-red-500' : ''}
                  ${state.lockedColor === 'blue' ? 'bg-blue-500' : ''}
                  ${state.lockedColor === 'green' ? 'bg-green-500' : ''}
                  ${state.lockedColor === 'yellow' ? 'bg-yellow-500' : ''}
                `} />
                            {state.lockedColor}
                        </div>
                    )}
                </div>
            </div>

            {/* Info / Turn Timer Tracker */}
            <div className="absolute bottom-40 right-8 flex flex-col gap-3 items-end z-10 pointer-events-none">
                <div className="px-4 py-2 glass-panel text-xs font-mono flex items-center tracking-widest text-zinc-400 shadow-sm">
                    <span className={`${timeRemaining < 6 ? 'text-red-500 font-bold' : ''}`}>TIMER: {timeRemaining}s</span>
                </div>
                <div className="px-4 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-700/80 text-[10px] font-bold tracking-widest text-zinc-400 uppercase shadow-sm">
                    Turn {state.turnCount}
                </div>
                {state.globalCooldown > 0 && (
                    <div className="px-4 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500 text-[10px] font-bold tracking-widest uppercase">
                        Cooldown: {state.globalCooldown}
                    </div>
                )}
            </div>

            {/* Action Logs */}
            {state.lastAction && (
                <div className="absolute top-[40%] w-full flex justify-center pointer-events-none z-30">
                    <motion.div
                        key={state.turnCount}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-6 py-2.5 bg-zinc-800 text-zinc-200 text-xs font-bold tracking-wider border border-zinc-700 shadow-xl rounded-full"
                    >
                        {state.lastAction}
                    </motion.div>
                </div>
            )}

        </div>
    );
};
