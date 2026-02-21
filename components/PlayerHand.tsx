import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Card as CardType } from '../lib/types';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../lib/audio/SoundManager';

interface PlayerHandProps {
    cards: CardType[];
    onPlayCard: (cardIds: string[]) => void;
    isMyTurn: boolean;
    disabled?: boolean;
    playableCardIds?: string[];
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, onPlayCard, isMyTurn, disabled, playableCardIds }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showInventory, setShowInventory] = useState(false);
    const [windowWidth, setWindowWidth] = useState(1024);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const MAX_VISIBLE_CARDS = 15;

    // Auto-sort algorithm: Playable cards move to front, then sort by color to group them beautifully
    const sortedCards = useMemo(() => {
        return [...cards].sort((a, b) => {
            const aPlayable = playableCardIds?.includes(a.id) ? 1 : 0;
            const bPlayable = playableCardIds?.includes(b.id) ? 1 : 0;

            // Rule 1: Playable cards first
            if (aPlayable !== bPlayable) return bPlayable - aPlayable;

            // Rule 2: Group by Color
            if (a.color !== b.color) return a.color.localeCompare(b.color);

            // Rule 3: Group by Type/Value
            return (a.type || '').localeCompare(b.type || '');
        });
    }, [cards, playableCardIds]);

    const visibleCards = sortedCards.slice(0, MAX_VISIBLE_CARDS);
    const inventoryCardsCount = Math.max(0, sortedCards.length - MAX_VISIBLE_CARDS);

    // Fanning math parameters
    const getCardStyle = (index: number, total: number) => {
        const isMobile = windowWidth < 768;
        // Tighter rotation bounds for mobile
        const maxRot = Math.min(isMobile ? 18 : 25, total * (isMobile ? 2.5 : 3));
        const step = total > 1 ? (maxRot * 2) / (total - 1) : 0;
        const rot = -maxRot + index * step;
        const yOffset = Math.abs(rot) * (isMobile ? 0.3 : 0.5);

        // More negative margin = more overlap
        let margin = '-1.5rem';
        if (total > 5) margin = isMobile ? '-3.8rem' : '-2.5rem';
        if (total > 10) margin = isMobile ? '-4.6rem' : '-2.8rem'; // reduced squeeze for desktop 15 cards

        return {
            rotateZ: rot,
            y: yOffset,
            margin
        };
    };

    const handleCardClick = (card: CardType) => {
        if (disabled || !isMyTurn) return;

        if (selectedIds.includes(card.id)) {
            // Deselect
            setSelectedIds(prev => prev.filter(id => id !== card.id));
        } else {
            // Select new
            if (selectedIds.length > 0) {
                const firstSelected = cards.find(c => c.id === selectedIds[0]);
                if (firstSelected &&
                    ((card.type === 'number' && firstSelected.type === 'number' && card.value === firstSelected.value) ||
                        (card.type !== 'number' && card.type === firstSelected.type))) {
                    playSound('click');
                    setSelectedIds(prev => [...prev, card.id]);
                } else {
                    playSound('invalidPlay');
                }
            } else {
                if (playableCardIds?.includes(card.id)) {
                    playSound('click');
                    setSelectedIds([card.id]);
                } else {
                    playSound('invalidPlay');
                }
            }
        }
    };

    const handlePlaySelected = () => {
        if (selectedIds.length > 0) {
            onPlayCard(selectedIds);
            setSelectedIds([]);
            setShowInventory(false);
        }
    };

    // Auto-clear selection if it's no longer our turn
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!isMyTurn) setSelectedIds([]);
    }, [isMyTurn]);

    return (
        <>
            <div
                className="relative w-full overflow-hidden px-2 py-8 sm:p-8 flex justify-center items-end h-[240px] sm:h-[280px]"
                ref={containerRef}
            >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 transition-colors">
                    <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 tracking-widest shadow-sm">
                        {visibleCards.length} {visibleCards.length === 1 ? 'CARD' : 'CARDS'}
                    </div>
                    {inventoryCardsCount > 0 && (
                        <button
                            onClick={() => { playSound('click'); setShowInventory(true); }}
                            onMouseEnter={() => playSound('hover')}
                            className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 tracking-widest shadow-sm transition-colors uppercase cursor-pointer"
                        >
                            + {inventoryCardsCount} INVENTORY
                        </button>
                    )}
                </div>

                <div className="relative flex justify-center w-full max-w-5xl" style={{ perspective: '1200px' }}>
                    <AnimatePresence>
                        {visibleCards.map((card, index) => {
                            const style = getCardStyle(index, visibleCards.length);
                            const isPlayable = playableCardIds ? playableCardIds.includes(card.id) : true;
                            const isSelected = selectedIds.includes(card.id);

                            return (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 150, scale: 0.8 }}
                                    animate={{ opacity: 1, y: style.y, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, y: -50, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                                    style={{
                                        marginLeft: index === 0 ? 0 : style.margin,
                                        transformOrigin: 'bottom center',
                                        zIndex: index,
                                    }}
                                    className="hover:z-50 cursor-pointer pointer-events-auto"
                                >
                                    <motion.div style={{ rotateZ: style.rotateZ, y: isSelected ? -30 : 0 }} className="transition-transform duration-300 w-fit h-fit">
                                        <Card
                                            card={card}
                                            onClick={() => handleCardClick(card)}
                                            disabled={disabled || !isMyTurn || !isPlayable}
                                            className={`shadow-xl ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-zinc-950 scale-110' : (isMyTurn && isPlayable && selectedIds.length === 0 ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-zinc-950 scale-105 hover:z-50' : '')}`}
                                        />
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-6 z-[100] flex items-center justify-center pointer-events-auto"
                        >
                            <button
                                onClick={handlePlaySelected}
                                className="bg-yellow-400 text-zinc-900 border-4 border-zinc-900 border-b-[8px] px-8 py-3 rounded-2xl font-black text-xl tracking-widest uppercase hover:translate-y-1 hover:border-b-4 transition-all"
                                style={{ fontFamily: 'Impact' }}
                            >
                                PLAY {selectedIds.length > 1 ? `${selectedIds.length} COMBO` : 'CARD'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Full Inventory Modal for Mass Draws */}
            <AnimatePresence>
                {showInventory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-[100] flex flex-col p-6 sm:p-12 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto w-full border-b border-zinc-800 pb-6">
                            <div className="flex flex-col">
                                <h2 className="text-3xl font-black uppercase tracking-widest text-white">Full Inventory</h2>
                                <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">{cards.length} Total Cards</span>
                            </div>
                            <button onClick={() => setShowInventory(false)} className="px-8 py-3 bg-white text-black font-black tracking-widest uppercase text-xs rounded-xl hover:bg-zinc-200 transition-transform hover:scale-105 shadow-xl">
                                Close Inventory
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full pb-32">
                            <div className="flex flex-wrap gap-4 justify-center">
                                {sortedCards.map((card) => {
                                    const isPlayable = playableCardIds ? playableCardIds.includes(card.id) : true;
                                    const isSelected = selectedIds.includes(card.id);
                                    return (
                                        <motion.div
                                            key={card.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="origin-top"
                                        >
                                            <Card
                                                card={card}
                                                onClick={() => handleCardClick(card)}
                                                disabled={disabled || !isMyTurn || !isPlayable}
                                                className={`shadow-lg border ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-zinc-950 scale-110 relative z-20' : (isMyTurn && isPlayable && selectedIds.length === 0 ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-zinc-950 scale-105 cursor-pointer hover:-translate-y-2 relative z-10' : '')}`}
                                            />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        {selectedIds.length > 0 && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[110]">
                                <button
                                    onClick={handlePlaySelected}
                                    className="bg-yellow-400 text-zinc-900 border-4 border-zinc-900 border-b-[8px] px-12 py-4 rounded-2xl font-black text-2xl tracking-widest uppercase hover:translate-y-1 hover:border-b-4 transition-all shadow-2xl"
                                    style={{ fontFamily: 'Impact' }}
                                >
                                    PLAY {selectedIds.length > 1 ? `${selectedIds.length} COMBO` : 'CARD'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
