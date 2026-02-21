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

    // Vivid, flat cartoon colors
    const hexColors: Record<CardType['color'], string> = {
        red: "#ef4444",
        blue: "#3b82f6",
        green: "#22c55e",
        yellow: "#eab308",
        cyan: "#06b6d4",
        wild: "#3f3f46" // Dark gray for wild base
    };

    const iconColor = hexColors[card.color];
    const strokeColor = "#18181b"; // Dark zinc for cartoon outlines

    const displayValue = card.type === 'number' ? card.value : (
        card.type === 'skip' ? '⊘' :
            card.type === 'reverse' ? '⇄' :
                card.type === '+2' ? '+2' :
                    card.type === 'wild' ? 'W' :
                        card.type.replace('global_', '').replace('_', ' ').toUpperCase()
    );

    const getCornerSymbol = () => {
        switch (card.color) {
            case 'red': return <path d="M50 85 C50 85 10 55 10 30 C10 10 35 10 50 30 C65 10 90 10 90 30 C90 55 50 85 50 85 Z" fill={iconColor} stroke={strokeColor} strokeWidth="5" strokeLinejoin="round" />; // Heart/Flame
            case 'blue': return <path d="M50 15 L85 55 A25 25 0 0 1 15 55 Z" fill={iconColor} stroke={strokeColor} strokeWidth="5" strokeLinejoin="round" />; // Drop
            case 'green': return <path d="M50 15 C80 15 90 45 50 85 C10 45 20 15 50 15 Z" fill={iconColor} stroke={strokeColor} strokeWidth="5" strokeLinejoin="round" />; // Leaf/Spade
            case 'yellow': return <polygon points="50,10 65,40 100,45 75,70 80,100 50,85 20,100 25,70 0,45 35,40" fill={iconColor} stroke={strokeColor} strokeWidth="5" strokeLinejoin="round" />; // Star
            case 'cyan': return <polygon points="50,10 80,50 50,90 20,50" fill={iconColor} stroke={strokeColor} strokeWidth="5" strokeLinejoin="round" />; // Diamond
            default: return <circle cx="50" cy="50" r="30" fill={iconColor} stroke={strokeColor} strokeWidth="5" />;
        }
    };

    const getCenterSVG = () => {
        const val = card.type === 'number' ? card.value : displayValue;

        // Numbers & Simple Plus Cards
        if (card.type === 'number' || card.type === '+2' || parseInt(val as string)) {
            return (
                <g>
                    {/* Uno style tilted oval background */}
                    <ellipse cx="50" cy="50" rx="42" ry="30" fill="#fdfbf7" stroke={strokeColor} strokeWidth="6" transform="rotate(-30 50 50)" />
                    <ellipse cx="50" cy="50" rx="42" ry="30" fill={iconColor} stroke="none" transform="rotate(-30 50 50)" />

                    <text x="50" y="55" fontSize="45" fontWeight="900" textAnchor="middle" alignmentBaseline="middle" fill={strokeColor} stroke={strokeColor} strokeWidth="12" strokeLinejoin="round" fontFamily="Impact, sans-serif">{val}</text>
                    <text x="50" y="55" fontSize="45" fontWeight="900" textAnchor="middle" alignmentBaseline="middle" fill="#fff" fontFamily="Impact, sans-serif">{val}</text>
                </g>
            );
        }

        if (card.type === 'reverse') {
            return (
                <g transform="translate(10, 10) scale(0.8)">
                    {/* Arrow 1 */}
                    <path d="M 40 20 Q 80 20 80 50 Q 80 60 75 70" fill="none" stroke={strokeColor} strokeWidth="16" strokeLinecap="round" />
                    <path d="M 40 20 Q 80 20 80 50 Q 80 60 75 70" fill="none" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
                    <polygon points="30,20 55,5 55,35" fill={strokeColor} />
                    <polygon points="35,20 50,12 50,28" fill={iconColor} />

                    {/* Arrow 2 */}
                    <path d="M 60 80 Q 20 80 20 50 Q 20 40 25 30" fill="none" stroke={strokeColor} strokeWidth="16" strokeLinecap="round" />
                    <path d="M 60 80 Q 20 80 20 50 Q 20 40 25 30" fill="none" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
                    <polygon points="70,80 45,95 45,65" fill={strokeColor} />
                    <polygon points="65,80 50,88 50,72" fill={iconColor} />
                </g>
            );
        }

        if (card.type === 'skip') {
            return (
                <g>
                    <circle cx="50" cy="50" r="35" fill="none" stroke={strokeColor} strokeWidth="16" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke={iconColor} strokeWidth="8" />
                    <line x1="25" y1="25" x2="75" y2="75" stroke={strokeColor} strokeWidth="16" strokeLinecap="round" />
                    <line x1="25" y1="25" x2="75" y2="75" stroke={iconColor} strokeWidth="8" strokeLinecap="round" />
                </g>
            )
        }

        if (card.type === 'bomb_timer') {
            return (
                <g transform="translate(10, 15) scale(0.8)">
                    <path d="M 60 20 Q 70 10 90 20" fill="none" stroke={strokeColor} strokeWidth="6" strokeDasharray="5 5" />
                    <circle cx="50" cy="65" r="35" fill={strokeColor} />
                    <circle cx="50" cy="65" r="30" fill="#27272a" />
                    <rect x="40" y="20" width="20" height="15" fill={strokeColor} rx="4" />
                    <circle cx="35" cy="50" r="8" fill="#ffffff" opacity="0.3" />
                    <text x="50" y="75" fontSize="24" textAnchor="middle" fill="#ef4444" fontWeight="900" style={{ fontFamily: 'Impact' }}>3</text>
                </g>
            )
        }

        if (card.type === 'wild' || card.type === 'chaos_wild') {
            return (
                <g>
                    <path d="M 50 15 L 85 50 L 50 85 L 15 50 Z" fill={strokeColor} />
                    <path d="M 50 25 L 75 50 L 50 75 L 25 50 Z" fill={card.type === 'chaos_wild' ? '#a855f7' : '#eab308'} />
                    <circle cx="50" cy="50" r="10" fill="#ef4444" />
                </g>
            )
        }

        if (card.type === 'steal_hand' || card.type === 'hand_shuffle') {
            return (
                <g transform="translate(10,15) scale(0.8)">
                    {/* Simplified hand */}
                    <path d="M 30 80 L 30 40 A 10 10 0 0 1 50 40 L 50 20 A 10 10 0 0 1 70 20 L 70 30 A 10 10 0 0 1 90 30 L 90 80 Z" fill={iconColor} stroke={strokeColor} strokeWidth="8" strokeLinejoin="round" />
                    {card.type === 'hand_shuffle' && <path d="M 20 50 L 80 50 M 50 20 L 50 80" stroke="#fff" strokeWidth="6" strokeLinecap="round" />}
                </g>
            )
        }

        // Default icon for other chaos/global
        return (
            <g>
                <polygon points="50,15 85,80 15,80" fill={iconColor} stroke={strokeColor} strokeWidth="10" strokeLinejoin="round" />
                <text x="50" y="65" fontSize="30" fontWeight="900" textAnchor="middle" fill="#fff" stroke={strokeColor} strokeWidth="4">!</text>
            </g>
        )
    };

    return (
        <motion.div
            whileHover={!disabled ? { y: -10, scale: 1.05, transition: { duration: 0.1 } } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={!disabled ? onClick : undefined}
            className={cn(
                "relative w-[110px] h-[160px] rounded-xl flex flex-col justify-between p-2 select-none",
                "bg-[#fdfbf7] border-[3px] border-zinc-900 shadow-[4px_4px_0px_#18181b]", // ⬅️ Cartoon / Poker aesthetic base
                disabled ? "opacity-40 cursor-not-allowed grayscale shadow-none translate-y-[4px] translate-x-[4px]" : "cursor-pointer",
                className
            )}
        >
            {/* Inner Colored Border */}
            <div className="absolute inset-2 border-2 rounded-lg pointer-events-none opacity-20" style={{ borderColor: iconColor }} />

            {/* Top Left Index */}
            <div className="flex flex-col items-center w-fit z-10" style={{ color: iconColor }}>
                <span className="text-2xl font-black leading-none" style={{ fontFamily: 'Impact, sans-serif', WebkitTextStroke: '1.5px #18181b' }}>{displayValue}</span>
                {card.color !== 'wild' && (
                    <svg width="12" height="12" viewBox="0 0 100 100" className="mt-0.5">
                        {getCornerSymbol()}
                    </svg>
                )}
            </div>

            {/* Center SVG Graphic */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-md">
                    {getCenterSVG()}
                </svg>
            </div>

            {/* Bottom Right Index (Rotated) */}
            <div className="flex flex-col items-center w-fit self-end rotate-180 z-10" style={{ color: iconColor }}>
                <span className="text-2xl font-black leading-none" style={{ fontFamily: 'Impact, sans-serif', WebkitTextStroke: '1.5px #18181b' }}>{displayValue}</span>
                {card.color !== 'wild' && (
                    <svg width="12" height="12" viewBox="0 0 100 100" className="mt-0.5">
                        {getCornerSymbol()}
                    </svg>
                )}
            </div>

            {/* Badges for special cards */}
            {(isChaos || isGlobal) && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20">
                    {isGlobal ? 'GLOBAL' : 'CHAOS'}
                </div>
            )}
        </motion.div>
    );
};
