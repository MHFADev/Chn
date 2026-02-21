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
    const isChaos = ['+20', '+30', 'reflect', 'steal_hand', 'hand_shuffle', 'double_turn', 'lock_color', 'bomb_timer', 'copy_card', 'chaos_wild'].includes(card.type);

    // Muted, professional color palette
    const colorStyles = {
        red: "text-red-500 border-red-500/30 bg-red-500/5",
        blue: "text-blue-500 border-blue-500/30 bg-blue-500/5",
        green: "text-green-500 border-green-500/30 bg-green-500/5",
        yellow: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
        wild: "text-purple-500 border-purple-500/30 bg-purple-500/5",
    };

    const iconColor = {
        red: "#ef4444",
        blue: "#3b82f6",
        green: "#22c55e",
        yellow: "#eab308",
        wild: "#a855f7"
    }[card.color];

    const displayValue = card.type === 'number' ? card.value : (
        card.type === 'skip' ? '⊘' :
            card.type === 'reverse' ? '⇄' :
                card.type === '+2' ? '+2' :
                    card.type === 'wild' ? 'W' :
                        card.type.toUpperCase().replace('GLOBAL_', '').replace('_', ' ')
    );

    return (
        <motion.div
            whileHover={!disabled ? { y: -8, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={!disabled ? onClick : undefined}
            className={cn(
                "relative w-[100px] h-[150px] rounded-xl flex flex-col justify-between p-3 select-none transition-all duration-300",
                "bg-zinc-900 border backdrop-blur-sm shadow-sm",
                colorStyles[card.color],
                disabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer hover:shadow-md",
                isGlobal && "border-white/20 bg-zinc-800",
                className
            )}
        >
            {/* Top Left Indicator */}
            <div className="text-sm font-bold tracking-tighter leading-none flex flex-col items-center w-fit">
                <span>{displayValue}</span>
            </div>

            {/* Center Abstract SVG Graphic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-sm">
                    {card.type === 'number' ? (
                        <>
                            <circle cx="50" cy="50" r="45" fill="none" stroke={iconColor} strokeWidth="2" opacity="0.2" />
                            <text x="50" y="52" fontSize="50" fontWeight="900" textAnchor="middle" alignmentBaseline="middle" fill={iconColor} fontFamily="Inter, sans-serif">{card.value}</text>
                        </>
                    ) : isGlobal ? (
                        <>
                            <polygon points="50,10 90,90 10,90" fill="none" stroke={iconColor} strokeWidth="4" />
                            <polygon points="50,25 75,75 25,75" fill={iconColor} opacity="0.2" />
                            <text x="50" y="65" fontSize="24" fontWeight="900" textAnchor="middle" fill={iconColor} fontFamily="Inter, sans-serif">GLB</text>
                        </>
                    ) : isChaos ? (
                        <>
                            <path d="M 20 20 L 80 80 M 80 20 L 20 80" stroke={iconColor} strokeWidth="8" strokeLinecap="round" opacity="0.8" />
                            <rect x="30" y="30" width="40" height="40" fill="none" stroke={iconColor} strokeWidth="3" transform="rotate(45 50 50)" />
                        </>
                    ) : card.type === 'wild' ? (
                        <>
                            <path d="M 50 10 C 70 30 90 50 50 90 C 10 50 30 30 50 10 Z" fill={iconColor} opacity="0.7" />
                            <circle cx="50" cy="50" r="15" fill="#fafafa" opacity="0.9" />
                        </>
                    ) : (
                        <>
                            <circle cx="50" cy="50" r="40" fill="none" stroke={iconColor} strokeWidth="6" strokeDasharray="10 5" />
                            <text x="50" y="54" fontSize="30" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" fill={iconColor} fontFamily="Inter, sans-serif">{displayValue}</text>
                        </>
                    )}
                </svg>
            </div>

            {/* Tags (Bottom) */}
            <div className="flex flex-col items-end w-full z-10">
                {isChaos && !isGlobal && <span className="text-[9px] uppercase tracking-widest font-semibold opacity-70">Chaos</span>}
                {isGlobal && <span className="text-[10px] uppercase font-black tracking-widest text-white/90">Global</span>}
                <div className="text-sm font-bold tracking-tighter leading-none rotate-180 mt-1">
                    {displayValue}
                </div>
            </div>
        </motion.div>
    );
};
