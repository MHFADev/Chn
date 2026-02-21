import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    card: CardType;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, className, disabled }) => {
    const isGlobal = card.type.startsWith('global_');
    const isChaos = card.type === '+20' || card.type === '+30' || card.type === 'reflect' ||
        card.type === 'steal_hand' || card.type === 'hand_shuffle' ||
        card.type === 'double_turn' || card.type === 'lock_color' ||
        card.type === 'bomb_timer' || card.type === 'copy_card' || card.type === 'chaos_wild';

    const colorStyles = {
        red: "bg-red-950 border-neon-red text-neon-red shadow-[0_0_15px_rgba(255,42,42,0.5)]",
        blue: "bg-blue-950 border-neon-blue text-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.5)]",
        green: "bg-green-950 border-neon-green text-neon-green shadow-[0_0_15px_rgba(57,255,20,0.5)]",
        yellow: "bg-yellow-950 border-neon-yellow text-neon-yellow shadow-[0_0_15px_rgba(255,234,0,0.5)]",
        wild: "bg-gray-900 border-neon-purple text-neon-purple shadow-[0_0_20px_rgba(181,42,255,0.7)]",
    };

    const displayValue = card.type === 'number' ? card.value : card.type.toUpperCase().replace('_', ' ');

    return (
        <motion.div
            whileHover={!disabled ? { scale: 1.05, y: -10 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={!disabled ? onClick : undefined}
            className={cn(
                "relative w-24 h-36 rounded-xl border-2 flex flex-col justify-between p-2 select-none cursor-pointer transition-colors duration-300",
                colorStyles[card.color],
                isGlobal ? "glitch-animation border-4" : "",
                disabled ? "opacity-50 cursor-not-allowed grayscale" : "",
                className
            )}
        >
            <div className="text-xs font-bold leading-none">{displayValue}</div>
            <div className="text-center text-xl font-black drop-shadow-md">
                {displayValue}
                {isChaos && !isGlobal && <div className="text-[10px] uppercase mt-1 opacity-80 mt-[-2px]">CHAOS</div>}
                {isGlobal && <div className="text-[12px] uppercase mt-1 text-red-500 animate-pulse font-black mt-[-2px]">GLOBAL</div>}
            </div>
            <div className="text-xs font-bold leading-none self-end rotate-180">{displayValue}</div>

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-xl" />
        </motion.div>
    );
};
