'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameState } from '../../../lib/types';
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

    const handlePlayCard = async (cardId: string) => {
        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerId, action: 'play', cardId })
        });
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
        <div className="h-screen w-full flex flex-col bg-zinc-950 overflow-hidden text-zinc-100 relative">
            {/* Header */}
            <header className="h-16 border-b border-zinc-800/80 flex items-center justify-between px-8 z-10 bg-zinc-900/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <span className="font-bold tracking-widest text-xs text-zinc-400 uppercase flex items-center gap-3">
                        <div className="w-6 h-6 bg-white text-black flex items-center justify-center rounded text-[10px] font-black -rotate-6">C</div>
                        ROOM: <span className="text-white bg-zinc-800 px-2 py-1 rounded ml-1">{roomId}</span>
                    </span>
                    <span className="text-[10px] px-2 py-1 border border-zinc-700 rounded text-zinc-400 font-bold uppercase tracking-widest">{state.status}</span>
                </div>
                <div className="text-xs font-bold tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md shadow-sm">
                    {state.players.length} / 6 PLAYERS
                </div>
            </header>

            {/* Main Area */}
            {state.status === 'waiting' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                    <h2 className="text-2xl font-black mb-10 uppercase tracking-widest">Waiting for Players</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-2xl w-full">
                        {state.players.map(p => (
                            <div key={p.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center gap-3 shadow-sm">
                                <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-black text-xl text-zinc-400">{p.name[0]?.toUpperCase()}</div>
                                <span className="font-bold tracking-widest text-sm uppercase">{p.name} {p.id === playerId ? <span className="text-zinc-500 ml-1 text-xs">YOU</span> : ''}</span>
                            </div>
                        ))}
                        {Array.from({ length: 6 - state.players.length }).map((_, i) => (
                            <div key={i} className="p-6 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center opacity-40">
                                <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">Empty Slot</span>
                            </div>
                        ))}
                    </div>

                    {state.players.length >= 2 && state.players[0].id === playerId && (
                        <button
                            onClick={handleStartGame}
                            className="px-10 py-3.5 bg-white text-black font-black uppercase text-sm tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg"
                        >
                            START GAME
                        </button>
                    )}

                    {state.players.length < 2 && (
                        <p className="opacity-50 text-xs font-bold tracking-widest uppercase text-zinc-500 flex items-center gap-2">
                            <span className="animate-pulse">●</span> Waiting for more players to join...
                        </p>
                    )}
                </div>
            ) : state.status === 'finished' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">MATCH CONCLUDED</span>
                    <h1 className="text-5xl font-black mb-8 uppercase tracking-tighter shadow-sm text-white">GAME OVER</h1>
                    <div className="bg-zinc-900 border border-zinc-800 px-10 py-6 rounded-2xl shadow-xl flex flex-col items-center mb-10">
                        <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase mb-2">Winner</span>
                        <span className="text-3xl font-black uppercase tracking-widest text-white">{state.players.find(p => p.id === state.winnerId)?.name}</span>
                    </div>
                    <button onClick={() => router.push('/')} className="px-8 py-3 bg-zinc-800 border border-zinc-700 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors">BACK TO LOBBY</button>
                </div>
            ) : (
                <>
                    {/* Playing Status */}
                    <GameBoard state={state} playerId={playerId} onDraw={handleDrawCard} />

                    {/* My Hand Container */}
                    <div className="relative z-20 mt-auto border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-lg">
                        {isMyTurn && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full shadow-lg border-2 border-zinc-950 z-30 pointer-events-none">
                                YOUR TURN
                            </div>
                        )}
                        {me && <PlayerHand cards={me.hand} onPlayCard={handlePlayCard} isMyTurn={isMyTurn} />}
                    </div>
                </>
            )}
        </div>
    );
}
