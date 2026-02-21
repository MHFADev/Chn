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
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-zinc-950">

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm bg-zinc-900/80 backdrop-blur border border-zinc-800 p-10 relative z-10 flex flex-col gap-8 rounded-2xl shadow-xl"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-6 flex items-center justify-center">
            <span className="text-black font-black text-2xl -rotate-12 tracking-tighter">C</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Chaos Global</h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Multiplayer Rules Engine</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-800">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-semibold text-center">{error}</div>}

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider ml-1">Identity</label>
            <input
              type="text"
              placeholder="PLAYER NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors uppercase tracking-widest font-bold text-xs"
              maxLength={12}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider ml-1">Room Access</label>
            <input
              type="text"
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors uppercase tracking-widest font-bold text-xs"
              maxLength={6}
            />
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-white text-black font-black uppercase text-xs tracking-widest py-3.5 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              CREATE NEW ROOM
            </button>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-transparent border border-zinc-700 text-zinc-300 font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              JOIN EXISTING
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
