import React from 'react';
import { GameState, Card as CardType } from '../lib/types';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, User, Settings2, Volume2, VolumeX } from 'lucide-react';
import { playSound, setMasterVolume, getMasterVolume, startBackgroundChill, stopBackgroundChill, getBackgroundVolume, setBackgroundVolume, isBackgroundEnabled } from '../lib/audio/SoundManager';

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

    const [now, setNow] = React.useState(() => Date.now());

    React.useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [volume, setVolume] = React.useState(() => getMasterVolume());
    const [bgOn, setBgOn] = React.useState(() => isBackgroundEnabled());
    const [bgVolume, setBgVol] = React.useState(() => getBackgroundVolume());
    const [turnLimit, setTurnLimit] = React.useState<number>(() => state.settings?.turnTimeLimit || 20);
    const [enableNumbers, setEnableNumbers] = React.useState<boolean>(state.settings?.enableNumbers ?? true);
    const [enableActions, setEnableActions] = React.useState<boolean>(state.settings?.enableActions ?? true);
    const [enableNormalDraws, setEnableNormalDraws] = React.useState<boolean>(state.settings?.enableNormalDraws ?? true);
    const [enableAbnormalDraws, setEnableAbnormalDraws] = React.useState<boolean>(state.settings?.enableAbnormalDraws ?? true);
    const [enableChaosCards, setEnableChaosCards] = React.useState<boolean>(state.settings?.enableChaosCards ?? true);
    const [allowedColors, setAllowedColors] = React.useState<string[]>(state.settings?.allowedColors ?? ['red','blue','green','yellow','cyan']);
    const [allowedNormalDraws, setAllowedNormalDraws] = React.useState<string[]>(state.settings?.allowedNormalDraws ?? ['+2','+4','+6']);
    const [allowedAbnormalDraws, setAllowedAbnormalDraws] = React.useState<string[]>(state.settings?.allowedAbnormalDraws ?? ['+20','+60','+100','+200']);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        setMasterVolume(val);
        if (val > 0) playSound('click');
    };
    const handleBgVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setBgVol(val);
        setBackgroundVolume(val);
    };
    const handleBgToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setBgOn(checked);
        if (checked) {
            startBackgroundChill();
        } else {
            stopBackgroundChill();
        }
    };

    const timeRemaining = Math.max(0, (state.settings?.turnTimeLimit || 20) - Math.floor((now - state.turnStartTime) / 1000));

    const isHost = state.players[0]?.id === playerId && state.status === 'waiting';
    const toggleColor = (c: string) => {
        setAllowedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };
    const saveSettings = async () => {
        playSound('click');
        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomId: state.roomId,
                playerId,
                action: 'update_settings',
                settings: {
                    turnTimeLimit: turnLimit,
                    enableNumbers,
                    enableActions,
                    enableNormalDraws,
                    enableAbnormalDraws,
                    enableChaosCards,
                    allowedColors,
                    allowedNormalDraws,
                    allowedAbnormalDraws
                }
            })
        });
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-between p-6 relative z-0">

            {/* Opponents Area */}
            <div className="w-full flex justify-around p-2 sm:p-4 h-24 sm:h-32 mt-2 sm:mt-4 max-w-5xl mx-auto overflow-x-auto gap-2">
                {opponents.map((p, i) => {
                    const isTurn = state.players[state.turnIndex]?.id === p.id;
                    return (
                        <div key={p.id} className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-4 ${isTurn ? 'bg-yellow-400 border-zinc-900 shadow-[6px_6px_0px_#18181b] scale-110 -translate-y-2' : 'bg-white border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] opacity-90'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {p.isAI ? <Cpu size={16} className="text-zinc-900" /> : <User size={16} className="text-zinc-900" />}
                                <span className="font-black text-sm tracking-widest uppercase text-zinc-900">{p.name}</span>
                            </div>
                            <div className="flex gap-2 items-center bg-zinc-900 px-4 py-1.5 rounded-xl border-2 border-zinc-900">
                                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">CARDS</span>
                                <span className="font-black text-base text-white">{p.hand.length || 0}</span>
                            </div>
                            {isTurn && <div className="text-[10px] text-zinc-800 font-black uppercase tracking-widest mt-3 animate-pulse">Thinking...</div>}
                        </div>
                    )
                })}
            </div>

            {/* Center Area */}
            <div className="flex-1 w-full flex items-center justify-center gap-8 sm:gap-16 relative py-6 sm:py-12">
                {/* Active Stack Penalties */}
                {state.activeStack && state.activeStack.totalDraw > 0 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center bg-red-500 border-4 border-zinc-900 text-white px-8 py-3 rounded-2xl font-black text-lg tracking-widest z-20 shadow-[6px_6px_0px_#18181b] animate-bounce">
                        STACK DRAW: +{state.activeStack.totalDraw}
                    </div>
                )}

                {/* Deck Pile */}
                <motion.div
                    whileHover={isMyTurn ? { scale: 1.05, y: -4, rotateZ: -2 } : {}}
                    whileTap={isMyTurn ? { scale: 0.95 } : {}}
                    onClick={isMyTurn ? onDraw : undefined}
                    className={`w-[80px] h-[118px] sm:w-[110px] sm:h-[160px] rounded-2xl border-4 border-zinc-900 bg-zinc-900 shadow-[8px_8px_0px_#18181b] flex items-center justify-center cursor-pointer relative overflow-hidden group ${isMyTurn ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-transparent animate-soft-float z-10' : 'opacity-90'}`}
                >
                    <img src="/card-back.jpg" alt="Deck" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <span className="text-3xl opacity-20 font-black tracking-widest -rotate-45 text-white drop-shadow-[2px_2px_0px_#000] relative z-0" style={{ fontFamily: 'Impact' }}>CHAOS</span>
                    <div className="absolute top-2 right-2 text-xs font-black text-white bg-zinc-900 px-2 py-1 rounded-lg border-2 border-zinc-900 shadow-sm z-10">{state.deck.length}</div>
                </motion.div>

                {/* Discard Pile */}
                <div className="relative w-[80px] h-[118px] sm:w-[110px] sm:h-[160px]">
                    {topDiscard ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, rotate: (topDiscard.id.charCodeAt(0) % 8) - 4 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="absolute inset-0 z-10"
                        >
                            <Card disabled={false} className="w-full h-full shadow-[6px_6px_0px_#18181b] cursor-default" card={topDiscard} />
                        </motion.div>
                    ) : (
                        <div className="w-full h-full rounded-2xl border-4 border-dashed border-zinc-900 bg-white/50 flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest text-center px-4 text-zinc-900 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
                            <div>DISCARD</div><div>PILE</div>
                        </div>
                    )}

                    {/* Locked Color Indicator */}
                    {state.lockedColor && (
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-4 bg-white text-zinc-900 border-zinc-900 flex items-center gap-3 shadow-[4px_4px_0px_#18181b] whitespace-nowrap z-20">
                            <div className={`w-4 h-4 rounded-full border-2 border-zinc-900 shadow-sm
                  ${state.lockedColor === 'red' ? 'bg-red-500' : ''}
                  ${state.lockedColor === 'blue' ? 'bg-blue-500' : ''}
                  ${state.lockedColor === 'green' ? 'bg-green-500' : ''}
                  ${state.lockedColor === 'yellow' ? 'bg-yellow-500' : ''}
                  ${state.lockedColor === 'cyan' ? 'bg-cyan-500' : ''}
                `} />
                            {state.lockedColor}
                        </div>
                    )}
                </div>
            </div>

            {/* Info / Turn Timer Tracker */}
            <div className="absolute bottom-32 sm:bottom-40 right-2 sm:right-8 flex flex-col gap-2 sm:gap-3 items-end z-10 pointer-events-none">
                <div className="px-5 py-2 bg-white border-4 border-zinc-900 rounded-xl text-sm font-black flex items-center tracking-widest text-zinc-900 shadow-[4px_4px_0px_#18181b]">
                    <span className={`${timeRemaining < 6 ? 'text-red-500' : ''}`}>TIMER: {timeRemaining}s</span>
                </div>
                <div className="px-5 py-2 bg-blue-100 rounded-xl border-4 border-zinc-900 text-xs font-black tracking-widest text-blue-900 uppercase shadow-[4px_4px_0px_#18181b]">
                    Turn {state.turnCount}
                </div>
                {state.globalCooldown > 0 && (
                    <div className="px-5 py-2 bg-red-100 rounded-xl border-4 border-red-500 text-red-600 font-black tracking-widest uppercase shadow-[4px_4px_0px_#ef4444]">
                        Cooldown: {state.globalCooldown}
                    </div>
                )}
            </div>

            {/* Action Logs */}
            {state.lastAction && (
                <div className="absolute top-[35%] w-full flex justify-center pointer-events-none z-30">
                    <motion.div
                        key={state.turnCount}
                        initial={{ opacity: 0, scale: 0.5, y: -20, rotateZ: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateZ: 0 }}
                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                        className="px-8 py-3 bg-white text-zinc-900 text-sm md:text-xl font-black tracking-widest border-4 border-zinc-900 shadow-[8px_8px_0px_rgba(239,68,68,1)] rounded-2xl"
                        style={{ fontFamily: 'Impact' }}
                    >
                        {state.lastAction}
                    </motion.div>
                </div>
            )}

            {/* Settings Button */}
            <button
                onClick={() => { playSound('click'); setIsSettingsOpen(true); }}
                onMouseEnter={() => playSound('hover')}
                className="absolute top-4 right-4 bg-white border-4 border-zinc-900 p-2 rounded-xl shadow-[4px_4px_0px_#18181b] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181b] transition-all z-40 text-zinc-900"
            >
                <Settings2 size={24} />
            </button>

            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
                    >
                        <div className="bg-white border-4 border-zinc-900 p-8 rounded-3xl max-w-sm w-full flex flex-col items-center gap-6 shadow-[8px_8px_0px_#18181b] relative">
                            <button
                                onClick={() => { playSound('click'); setIsSettingsOpen(false); }}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 font-black text-2xl transition-colors"
                            >×</button>
                            <h3 className="text-3xl font-black uppercase tracking-widest text-center text-zinc-900" style={{ fontFamily: 'Impact' }}>SETTINGS</h3>

                            <div className="w-full flex flex-col gap-4">
                                <label className="flex flex-col gap-2 font-black uppercase tracking-widest text-zinc-900">
                                    <div className="flex items-center justify-between">
                                        <span>Master Volume</span>
                                        {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} className="text-red-500" />}
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.01"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-full h-4 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 border-2 border-zinc-900"
                                    />
                                </label>
                                {isHost && (
                                    <>
                                        <label className="flex flex-col gap-2 font-black uppercase tracking-widest text-zinc-900">
                                            <div className="flex items-center justify-between">
                                                <span>Turn Timer (sec)</span>
                                                <span>{turnLimit}s</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={5} max={120} step={5}
                                                value={turnLimit}
                                                onChange={e => setTurnLimit(parseInt(e.target.value))}
                                                className="w-full h-4 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 border-2 border-zinc-900"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between font-black uppercase tracking-widest text-zinc-900">
                                            <span>Background Chill</span>
                                            <input type="checkbox" checked={bgOn} onChange={handleBgToggle} />
                                        </label>
                                        <label className="flex flex-col gap-2 font-black uppercase tracking-widest text-zinc-900">
                                            <div className="flex items-center justify-between">
                                                <span>Background Volume</span>
                                                <span>{Math.round(bgVolume * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="0.4" step="0.01"
                                                value={bgVolume}
                                                onChange={handleBgVolumeChange}
                                                className="w-full h-4 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 border-2 border-zinc-900"
                                            />
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="flex items-center gap-2 text-zinc-900 font-black uppercase tracking-widest">
                                                <input type="checkbox" checked={enableNumbers} onChange={e => setEnableNumbers(e.target.checked)} />
                                                Numbers
                                            </label>
                                            <label className="flex items-center gap-2 text-zinc-900 font-black uppercase tracking-widest">
                                                <input type="checkbox" checked={enableActions} onChange={e => setEnableActions(e.target.checked)} />
                                                Actions
                                            </label>
                                            <label className="flex items-center gap-2 text-zinc-900 font-black uppercase tracking-widest">
                                                <input type="checkbox" checked={enableNormalDraws} onChange={e => setEnableNormalDraws(e.target.checked)} />
                                                Normal Draws
                                            </label>
                                            <label className="flex items-center gap-2 text-zinc-900 font-black uppercase tracking-widest">
                                                <input type="checkbox" checked={enableAbnormalDraws} onChange={e => setEnableAbnormalDraws(e.target.checked)} />
                                                Abnormal Draws
                                            </label>
                                            <label className="flex items-center gap-2 text-zinc-900 font-black uppercase tracking-widest col-span-2">
                                                <input type="checkbox" checked={enableChaosCards} onChange={e => setEnableChaosCards(e.target.checked)} />
                                                Chaos Cards
                                            </label>
                                        </div>
                                        {enableNormalDraws && (
                                            <div className="flex flex-wrap gap-2">
                                                {['+2','+4','+6'].map(t => {
                                                    const checked = allowedNormalDraws.includes(t);
                                                    return (
                                                        <label key={t} className={`px-3 py-1 rounded-lg border-2 border-zinc-900 font-black uppercase text-xs cursor-pointer ${checked ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
                                                            <input type="checkbox" className="hidden" checked={checked} onChange={() => setAllowedNormalDraws(prev => checked ? prev.filter(x => x !== t) : [...prev, t])} />
                                                            {t}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {enableAbnormalDraws && (
                                            <div className="flex flex-wrap gap-2">
                                                {['+20','+60','+100','+200','+300'].map(t => {
                                                    const checked = allowedAbnormalDraws.includes(t);
                                                    return (
                                                        <label key={t} className={`px-3 py-1 rounded-lg border-2 border-zinc-900 font-black uppercase text-xs cursor-pointer ${checked ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
                                                            <input type="checkbox" className="hidden" checked={checked} onChange={() => setAllowedAbnormalDraws(prev => checked ? prev.filter(x => x !== t) : [...prev, t])} />
                                                            {t}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {['red','blue','green','yellow','cyan'].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => toggleColor(c)}
                                                    className={`px-3 py-1 rounded-lg border-2 border-zinc-900 font-black uppercase text-xs ${allowedColors.includes(c) ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={saveSettings}
                                            className="w-full bg-yellow-400 text-zinc-900 border-4 border-zinc-900 border-b-[8px] px-6 py-3 rounded-2xl font-black text-base tracking-widest uppercase hover:translate-y-1 hover:border-b-4 transition-all"
                                            style={{ fontFamily: 'Impact' }}
                                        >
                                            Save Room Settings
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
