'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return setError('Please enter your name');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Save playerId to session storage so room page knows who we are
      sessionStorage.setItem('playerId', data.playerId);
      router.push(`/room/${data.roomId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!roomCode.trim()) return setError('Please enter room code');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode, playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sessionStorage.setItem('playerId', data.playerId);
      router.push(`/room/${data.roomId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0f] to-black">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/20 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 relative z-10 flex flex-col gap-6"
      >
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-red via-neon-yellow to-neon-red drop-shadow-[0_0_10px_rgba(255,42,42,0.8)] pb-2 uppercase">Chaos Global</h1>
          <p className="text-white/50 text-sm tracking-widest mt-1">Multiplayer Card Engine</p>
        </div>

        <div className="space-y-4 mt-4">
          {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-pulse">{error}</div>}

          <input
            type="text"
            placeholder="PLAYER NAME"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all uppercase tracking-wider font-bold text-center"
            maxLength={12}
          />

          <input
            type="text"
            placeholder="ROOM CODE"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all uppercase tracking-wider font-bold text-center"
            maxLength={6}
          />

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-neon-blue text-black font-black uppercase tracking-wider py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              CREATE
            </button>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-neon-green text-black font-black uppercase tracking-wider py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              JOIN
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
