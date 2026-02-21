'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { playSound } from '../lib/audio/SoundManager';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [enableNumbers, setEnableNumbers] = useState(true);
  const [enableActions, setEnableActions] = useState(true);
  const [enableNormalDraws, setEnableNormalDraws] = useState(true);
  const [enableAbnormalDraws, setEnableAbnormalDraws] = useState(true);
  const [enableChaosCards, setEnableChaosCards] = useState(true);
  const [allowedColors, setAllowedColors] = useState<string[]>(['red','blue','green','yellow','cyan']);
  const [allowedNormalDraws, setAllowedNormalDraws] = useState<string[]>(['+2','+4','+6']);
  const [allowedAbnormalDraws, setAllowedAbnormalDraws] = useState<string[]>(['+20','+60','+100','+200']);
  const toggleColor = (c: string) => setAllowedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleCreate = async () => {
    playSound('click');
    if (!name.trim()) return setError('Please enter your name');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: name,
          turnTimeLimit: timeLimit,
          settings: {
            turnTimeLimit: timeLimit,
            enableNumbers,
            enableActions,
            enableNormalDraws,
            enableAbnormalDraws,
            enableChaosCards,
            allowedColors,
            allowedNormalDraws,
            allowedAbnormalDraws
          }
        }),
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
            <label className="text-[12px] text-zinc-900 uppercase font-black tracking-wider ml-1">Identity & Rules</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PLAYER NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-blue-50 border-4 border-zinc-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:-translate-y-1 focus:shadow-[4px_4px_0px_#18181b] transition-all uppercase tracking-widest font-black text-sm text-zinc-900"
                maxLength={12}
              />
              <select
                value={timeLimit}
                onChange={(e) => { playSound('hover'); setTimeLimit(Number(e.target.value)); }}
                className="bg-blue-50 border-4 border-zinc-900 rounded-xl px-2 py-3 outline-none focus:bg-white focus:-translate-y-1 focus:shadow-[4px_4px_0px_#18181b] transition-all uppercase tracking-widest font-black text-sm text-zinc-900 cursor-pointer w-24 text-center"
              >
                <option value={10}>10s</option>
                <option value={20}>20s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
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
              onClick={() => { playSound('click'); setShowSettings(true); }}
              disabled={loading}
              onMouseEnter={() => playSound('hover')}
              className="w-full bg-yellow-300 border-4 border-zinc-900 text-zinc-900 font-black uppercase text-sm tracking-widest py-3.5 rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_#18181b] transition-all active:scale-95 disabled:opacity-50"
            >
              ROOM SETTINGS
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
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white border-4 border-zinc-900 p-8 rounded-3xl max-w-md w-full flex flex-col gap-6 shadow-[8px_8px_0px_#18181b] relative">
            <button
              onClick={() => { playSound('click'); setShowSettings(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 font-black text-2xl transition-colors"
            >×</button>
            <h3 className="text-3xl font-black uppercase tracking-widest text-center text-zinc-900" style={{ fontFamily: 'Impact' }}>ROOM SETTINGS</h3>

            <label className="flex flex-col gap-2 font-black uppercase tracking-widest text-zinc-900">
              <div className="flex items-center justify-between">
                <span>Turn Timer</span>
                <span>{timeLimit}s</span>
              </div>
              <input
                type="range"
                min={5} max={120} step={5}
                value={timeLimit}
                onChange={e => setTimeLimit(parseInt(e.target.value))}
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
                {['+20','+60','+100','+200'].map(t => {
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
              onClick={() => { playSound('click'); setShowSettings(false); }}
              className="w-full bg-yellow-400 text-zinc-900 border-4 border-zinc-900 border-b-[8px] px-6 py-3 rounded-2xl font-black text-base tracking-widest uppercase hover:translate-y-1 hover:border-b-4 transition-all"
              style={{ fontFamily: 'Impact' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
