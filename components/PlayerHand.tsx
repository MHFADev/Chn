import React, { useRef, useEffect } from 'react';
import { Card as CardType } from '../lib/types';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerHandProps {
    cards: CardType[];
    onPlayCard: (cardId: string) => void;
    isMyTurn: boolean;
    disabled?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, onPlayCard, isMyTurn, disabled }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className="relative w-full overflow-hidden p-8 flex justify-center items-end h-[250px]"
            ref={containerRef}
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/10 rounded-full text-xs text-white/70 font-mono tracking-wider mb-8 z-10 glass-panel">
                {cards.length} {cards.length === 1 ? 'CARD' : 'CARDS'}
            </div>
            <div className="relative flex justify-center w-full max-w-4xl" style={{ perspective: '1000px' }}>
                <AnimatePresence>
                    {cards.map((card, index) => {
                        const rot = (index - (cards.length - 1) / 2) * 5; // fanning angle
                        const yOffset = Math.abs(index - (cards.length - 1) / 2) * 2; // subtle curve

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.5, y: 100 }}
                                animate={{ opacity: 1, scale: 1, y: yOffset }}
                                exit={{ opacity: 0, scale: 0.5, y: -100, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                style={{
                                    marginLeft: index === 0 ? 0 : '-3rem',
                                    transformOrigin: 'bottom center',
                                    zIndex: index
                                }}
                                className="hover:z-50"
                            >
                                <motion.div style={{ rotateZ: rot }}>
                                    <Card
                                        card={card}
                                        onClick={() => !disabled && isMyTurn && onPlayCard(card.id)}
                                        disabled={disabled || !isMyTurn}
                                    />
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};
