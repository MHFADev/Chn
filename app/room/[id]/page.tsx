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

    // Setup heartbeat & polling
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
                    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchState(); // initial fetch
        const interval = setInterval(fetchState, 1500); // Poll every 1.5s

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
        // Optimistic UI could go here, but omitted for true server authority safety
        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerId, action: 'play', cardId })
            // omit color handling for standard wild selection to keep it simple, it'll just stay null/wild natively
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
        return <div className="h-screen w-full flex items-center justify-center text-neon-blue font-mono animate-pulse">CONNECTING TO ROOM...</div>;
    }

    const me = state.players.find(p => p.id === playerId);
    const isMyTurn = state.status === 'playing' && state.players[state.turnIndex].id === playerId;

    return (
        <div className="h-screen w-full flex flex-col bg-[#0a0a0f] overflow-hidden text-white relative">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 z-10 glass-panel !rounded-none">
                <div className="flex items-center gap-4">
                    <span className="font-bold tracking-widest text-lg">ROOM: <span className="text-neon-yellow">{roomId}</span></span>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded font-mono">{state.status.toUpperCase()}</span>
                </div>
                <div className="text-sm font-mono opacity-50">
                    {state.players.length} / 6 PLAYERS
                </div>
            </header>

            {/* Main Area */}
            {state.status === 'waiting' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                    <h2 className="text-3xl font-black mb-8 uppercase tracking-widest">Waiting for Players</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-2xl w-full">
                        {state.players.map(p => (
                            <div key={p.id} className="p-4 glass-panel flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xl">{p.name[0]?.toUpperCase()}</div>
                                <span className="font-bold tracking-wider">{p.name} {p.id === playerId ? '(YOU)' : ''}</span>
                            </div>
                        ))}
                        {Array.from({ length: 6 - state.players.length }).map((_, i) => (
                            <div key={i} className="p-4 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center opacity-30">
                                EMPTY
                            </div>
                        ))}
                    </div>

                    {state.players.length >= 2 && state.players[0].id === playerId && (
                        <button
                            onClick={handleStartGame}
                            className="px-12 py-4 bg-neon-green text-black font-black uppercase text-2xl tracking-widest rounded-xl hover:scale-105 transition-transform"
                        >
                            START GAME
                        </button>
                    )}

                    {state.players.length < 2 && (
                        <p className="opacity-50 text-sm">Waiting for more players to join...</p>
                    )}
                </div>
            ) : state.status === 'finished' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                    <h1 className="text-6xl font-black mb-4 uppercase drop-shadow-[0_0_20px_rgba(255,234,0,0.8)] text-neon-yellow">GAME OVER</h1>
                    <p className="text-2xl mb-12">Winner: {state.players.find(p => p.id === state.winnerId)?.name}</p>
                    <button onClick={() => router.push('/')} className="px-8 py-3 glass-panel hover:bg-white/10 transition-colors">BACK TO LOBBY</button>
                </div>
            ) : (
                <>
                    {/* Playing Status */}
                    <GameBoard state={state} playerId={playerId} onDraw={handleDrawCard} />

                    {/* My Hand Container */}
                    <div className="relative z-20 mt-auto border-t border-white/10 bg-gradient-to-t from-black to-transparent">
                        {isMyTurn && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-neon-green text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(57,255,20,0.5)] z-30 pointer-events-none">
                                YOUR TURN!
                            </div>
                        )}
                        {me && <PlayerHand cards={me.hand} onPlayCard={handlePlayCard} isMyTurn={isMyTurn} />}
                    </div>
                </>
            )}
        </div>
    );
}
