'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameState } from '../../../lib/types';
import { GameEngine } from '../../../lib/gameEngine';
import { GameBoard } from '../../../components/GameBoard';
import { PlayerHand } from '../../../components/PlayerHand';
import confetti from 'canvas-confetti';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const roomId = unwrappedParams.id;
    const [state, setState] = useState<GameState | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [pendingWildCardIds, setPendingWildCardIds] = useState<string[] | null>(null);

    useEffect(() => {
        const pId = sessionStorage.getItem('playerId');
        if (!pId) {
            router.push('/');
            return;
        }
        setPlayerId(pId);

        const fetchState = async () => {
            try {
                const res = await fetch(`/api/state?roomId=${roomId}&playerId=${pId}`);
                if (!res.ok) {
                    setError('Failed to sync. Redirecting...');
                    setTimeout(() => router.push('/'), 2000);
                    return;
                }
                const data = await res.json();
                setState(data);

                if (data.status === 'finished' && data.winnerId === pId) {
                    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ffffff', '#a1a1aa', '#3f3f46'] });
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchState();
        const interval = setInterval(fetchState, 1500);

        return () => clearInterval(interval);
    }, [roomId, router]);

    const handleStartGame = async () => {
        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerId, action: 'start_game' })
        });
    };

    const handlePlayCard = async (cardIds: string | string[], color?: string) => {
        const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
        const card = state?.players.find(p => p.id === playerId)?.hand.find(c => c.id === ids[0]);
        if (card?.color === 'wild' && !color) {
            setPendingWildCardIds(ids);
            return;
        }

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerId, action: 'play', cardIds: ids, color })
        });
        setPendingWildCardIds(null);
    };

    const handleDrawCard = async () => {
        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerId, action: 'draw' })
        });
    };

    if (!state || !playerId) {
        return <div className="h-screen w-full flex items-center justify-center text-zinc-500 font-mono tracking-widest text-sm animate-pulse bg-zinc-950">CONNECTING...</div>;
    }

    const me = state.players.find(p => p.id === playerId);
    const isMyTurn = state.status === 'playing' && state.players[state.turnIndex].id === playerId;

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden text-zinc-900 relative">
            {/* Header */}
            <header className="h-16 border-b-4 border-zinc-900 flex items-center justify-between px-8 z-10 bg-white shadow-sm">
                <div className="flex items-center gap-6">
                    <span className="font-black tracking-widest text-xs text-zinc-900 uppercase flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-400 border-2 border-zinc-900 text-zinc-900 flex items-center justify-center rounded-lg text-sm font-black -rotate-6 shadow-[2px_2px_0px_#18181b]">C</div>
                        ROOM: <span className="text-white bg-zinc-900 px-3 py-1.5 rounded-lg ml-1 shadow-[2px_2px_0px_#fde047]">{roomId}</span>
                    </span>
                    <span className="text-[10px] px-3 py-1.5 bg-blue-100 border-2 border-zinc-900 rounded-lg text-blue-900 font-black uppercase tracking-widest shadow-[2px_2px_0px_#18181b]">{state.status}</span>
                </div>
                <div className="text-xs font-black tracking-widest text-zinc-900 bg-green-100 border-2 border-zinc-900 px-4 py-2 rounded-lg shadow-[2px_2px_0px_#18181b]">
                    {state.players.length} / 6 PLAYERS
                </div>
            </header>

            {/* Main Area */}
            {state.status === 'waiting' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                    <h2 className="text-4xl font-black mb-12 uppercase tracking-widest text-white drop-shadow-[2px_2px_0px_#000] text-stroke text-stroke-black" style={{ WebkitTextStroke: '2px black' }}>WAITING FOR PLAYERS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-2xl w-full">
                        {state.players.map(p => (
                            <div key={p.id} className="p-6 bg-white border-4 border-zinc-900 rounded-2xl flex flex-col items-center gap-3 shadow-[6px_6px_0px_#18181b] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#18181b] transition-all">
                                <div className="w-16 h-16 rounded-full bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center font-black text-3xl text-zinc-900 shadow-[2px_2px_0px_#18181b]">{p.name[0]?.toUpperCase()}</div>
                                <span className="font-black tracking-widest text-sm uppercase text-zinc-900">{p.name} {p.id === playerId ? <span className="px-2 py-0.5 bg-red-500 text-white rounded-full ml-1 text-[10px] shadow-sm border-2 border-zinc-900">YOU</span> : ''}</span>
                            </div>
                        ))}
                        {Array.from({ length: 6 - state.players.length }).map((_, i) => (
                            <div key={i} className="p-6 bg-white/50 border-4 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center opacity-60">
                                <span className="text-xs font-black tracking-widest uppercase text-zinc-900">Empty Slot</span>
                            </div>
                        ))}
                    </div>

                    {state.players.length >= 2 && state.players[0].id === playerId && (
                        <button
                            onClick={handleStartGame}
                            className="px-12 py-4 bg-red-500 text-white border-4 border-zinc-900 font-black uppercase text-lg tracking-widest rounded-2xl hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181b] transition-all active:scale-95 shadow-[4px_4px_0px_#18181b]"
                        >
                            START GAME
                        </button>
                    )}

                    {state.players.length < 2 && (
                        <div className="bg-white border-4 border-zinc-900 px-6 py-3 rounded-xl shadow-[4px_4px_0px_#18181b]">
                            <p className="text-xs font-black tracking-widest uppercase text-zinc-900 flex items-center gap-3">
                                <span className="animate-pulse text-red-500 text-lg">●</span> Waiting for more players to join...
                            </p>
                        </div>
                    )}
                </div>
            ) : state.status === 'finished' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                    <span className="text-sm border-4 border-zinc-900 bg-yellow-400 px-4 py-1 rounded-full uppercase tracking-widest text-zinc-900 font-black mb-6 shadow-[2px_2px_0px_#18181b]">MATCH CONCLUDED</span>
                    <h1 className="text-6xl md:text-8xl font-black mb-10 uppercase tracking-tighter text-white drop-shadow-[4px_4px_0px_#000]" style={{ WebkitTextStroke: '4px black', fontFamily: 'Impact' }}>GAME OVER</h1>
                    <div className="bg-white border-4 border-zinc-900 px-16 py-8 rounded-3xl shadow-[8px_8px_0px_#18181b] flex flex-col items-center mb-12 rotate-2">
                        <span className="text-sm border border-zinc-900 bg-zinc-100 px-3 py-1 rounded-full text-zinc-600 font-black tracking-widest uppercase mb-4">Winner</span>
                        <span className="text-5xl font-black uppercase tracking-widest text-zinc-900" style={{ fontFamily: 'Impact' }}>{state.players.find(p => p.id === state.winnerId)?.name}</span>
                    </div>
                    <button onClick={() => router.push('/')} className="px-10 py-4 bg-blue-500 text-white border-4 border-zinc-900 text-sm font-black uppercase tracking-widest rounded-2xl hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181b] transition-all active:scale-95 shadow-[4px_4px_0px_#18181b]">BACK TO LOBBY</button>
                </div>
            ) : (
                <>
                    {/* Playing Status */}
                    <GameBoard state={state} playerId={playerId} onDraw={handleDrawCard} />

                    {/* My Hand Container */}
                    <div className="relative z-20 mt-auto border-t-4 border-zinc-900 bg-cyan-900/40 backdrop-blur-md">
                        {isMyTurn && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-2 bg-yellow-400 text-zinc-900 font-black uppercase text-sm tracking-widest rounded-full shadow-[4px_4px_0px_#18181b] border-4 border-zinc-900 z-30 pointer-events-none animate-bounce">
                                YOUR TURN
                            </div>
                        )}
                        {me && <PlayerHand
                            cards={me.hand}
                            onPlayCard={handlePlayCard}
                            isMyTurn={isMyTurn}
                            playableCardIds={isMyTurn ? me.hand.filter(c => GameEngine.isValidPlay(state, c, me)).map(c => c.id) : undefined}
                        />}
                    </div>
                </>
            )}

            {/* Wild Card Color Picker Modal */}
            {pendingWildCardIds && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
                    <div className="bg-white border-4 border-zinc-900 p-8 rounded-3xl max-w-sm w-full flex flex-col items-center gap-6 shadow-[8px_8px_0px_#18181b] relative">
                        <button
                            onClick={() => setPendingWildCardIds(null)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 font-black text-2xl transition-colors"
                        >×</button>
                        <h3 className="text-3xl font-black uppercase tracking-widest text-center text-zinc-900" style={{ fontFamily: 'Impact' }}>CHOOSE COLOR</h3>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {[
                                { id: 'red', color: '#ef4444', label: 'RED' },
                                { id: 'blue', color: '#3b82f6', label: 'BLUE' },
                                { id: 'green', color: '#22c55e', label: 'GREEN' },
                                { id: 'yellow', color: '#eab308', label: 'YELLOW' },
                                { id: 'cyan', color: '#06b6d4', label: 'CYAN' },
                            ].map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handlePlayCard(pendingWildCardIds, c.id)}
                                    className="h-16 rounded-2xl flex items-center justify-center font-black tracking-widest text-xl text-white border-4 border-zinc-900 shadow-[4px_4px_0px_#18181b] hover:translate-y-1 hover:shadow-[0px_0px_0px_#18181b] transition-all active:scale-95"
                                    style={{ backgroundColor: c.color, fontFamily: 'Impact' }}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
