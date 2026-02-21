import React, { useRef } from 'react';
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

    // Fanning math parameters
    const getCardStyle = (index: number, total: number) => {
        // If only few cards, don't fan as much
        const maxRot = Math.min(25, total * 3);
        const step = total > 1 ? (maxRot * 2) / (total - 1) : 0;
        const rot = -maxRot + index * step;

        // Parabolic arc for Y offset
        const yOffset = Math.abs(rot) * 0.5;

        return {
            rotateZ: rot,
            y: yOffset,
            margin: total > 5 ? '-2.5rem' : '-1.5rem'
        };
    };

    return (
        <div
            className="relative w-full overflow-hidden p-8 flex justify-center items-end h-[280px]"
            ref={containerRef}
        >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 tracking-widest shadow-sm z-10 transition-colors">
                {cards.length} {cards.length === 1 ? 'CARD' : 'CARDS'}
            </div>

            <div className="relative flex justify-center w-full max-w-5xl" style={{ perspective: '1200px' }}>
                <AnimatePresence>
                    {cards.map((card, index) => {
                        const style = getCardStyle(index, cards.length);

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
                                        onClick={() => !disabled && isMyTurn && onPlayCard(card.id)}
                                        disabled={disabled || !isMyTurn}
                                        className="shadow-xl"
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
