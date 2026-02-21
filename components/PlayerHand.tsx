import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Card as CardType } from '../lib/types';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerHandProps {
    cards: CardType[];
    onPlayCard: (cardId: string) => void;
    isMyTurn: boolean;
    disabled?: boolean;
    playableCardIds?: string[];
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, onPlayCard, isMyTurn, disabled, playableCardIds }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showInventory, setShowInventory] = useState(false);
    const [windowWidth, setWindowWidth] = useState(1024);

    useEffect(() => {
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
                            onClick={() => setShowInventory(true)}
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
                                    className="hover:z-50"
                                >
                                    <motion.div style={{ rotateZ: style.rotateZ }} className="transition-transform duration-300">
                                        <Card
                                            card={card}
                                            onClick={() => !disabled && isMyTurn && isPlayable && onPlayCard(card.id)}
                                            disabled={disabled || !isMyTurn || !isPlayable}
                                            className={`shadow-xl ${isMyTurn && isPlayable ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-zinc-950 scale-105' : ''}`}
                                        />
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
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
                                    return (
                                        <motion.div
                                            key={card.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="origin-top"
                                        >
                                            <Card
                                                card={card}
                                                onClick={() => {
                                                    if (!disabled && isMyTurn && isPlayable) {
                                                        setShowInventory(false);
                                                        onPlayCard(card.id);
                                                    }
                                                }}
                                                disabled={disabled || !isMyTurn || !isPlayable}
                                                className={`shadow-lg border ${isMyTurn && isPlayable ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-zinc-950 scale-105 cursor-pointer hover:-translate-y-2 relative z-10' : ''}`}
                                            />
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
