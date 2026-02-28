'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { playSound, startBackgroundChill } from '../lib/audio/SoundManager';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  // default settings now configured inside room
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bgOn, setBgOn] = useState(false);

  const handleCreate = async () => {
    playSound('click');
    if (!bgOn) { setBgOn(true); startBackgroundChill(); }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    playSound('click');
    if (!bgOn) { setBgOn(true); startBackgroundChill(); }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm bg-white border-4 border-zinc-900 p-10 relative z-10 flex flex-col gap-8 rounded-3xl shadow-[8px_8px_0px_#18181b]"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-yellow-400 border-4 border-zinc-900 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0px_#18181b] rotate-3 hover:scale-110 transition-transform">
            <span className="text-zinc-900 font-black text-4xl -rotate-12 tracking-tighter mix-blend-overlay">C</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase" style={{ fontFamily: 'Impact' }}>Chaos Global</h1>
          <p className="text-zinc-600 border border-zinc-900 bg-yellow-100 rounded-full py-1 text-[10px] uppercase font-bold tracking-widest shadow-sm">Multiplayer Rules Engine</p>
        </div>

        <div className="space-y-4 pt-4 border-t-4 border-zinc-900">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-semibold text-center">{error}</div>}

          <div className="space-y-1">
            <label className="text-[12px] text-zinc-900 uppercase font-black tracking-wider ml-1">Identity</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PLAYER NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-blue-50 border-4 border-zinc-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:-translate-y-1 focus:shadow-[4px_4px_0px_#18181b] transition-all uppercase tracking-widest font-black text-sm text-zinc-900"
                maxLength={12}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] text-zinc-900 uppercase font-black tracking-wider ml-1">Room Access</label>
            <input
              type="text"
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full bg-blue-50 border-4 border-zinc-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:-translate-y-1 focus:shadow-[4px_4px_0px_#18181b] transition-all uppercase tracking-widest font-black text-sm text-zinc-900"
              maxLength={6}
            />
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <button
              onClick={handleCreate}
              disabled={loading}
              onMouseEnter={() => playSound('hover')}
              className="w-full bg-red-500 text-white border-4 border-zinc-900 font-black uppercase text-sm tracking-widest py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_#18181b] transition-all active:scale-95 disabled:opacity-50"
            >
              CREATE NEW ROOM
            </button>
            <button
              onClick={handleJoin}
              disabled={loading}
              onMouseEnter={() => playSound('hover')}
              className="w-full bg-white border-4 border-zinc-900 text-zinc-900 font-black uppercase text-sm tracking-widest py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_#18181b] transition-all active:scale-95 disabled:opacity-50"
            >
              JOIN EXISTING
            </button>
          </div>
        </div>
      </motion.div>
      
    </div>
  );
}
