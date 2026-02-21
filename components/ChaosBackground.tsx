'use client';
import React from 'react';

export const ChaosBackground = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor: '#22d3ee' /* Cyan base */ }}>
            {/* Sunburst Rays */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite] origin-center scale-[1.5]" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <radialGradient id="sunburst" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stop-color="#38bdf8" stopOpacity="0.8" />
                        <stop offset="100%" stop-color="#0284c7" stopOpacity="0.8" />
                    </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#sunburst)" />
                <g fill="#bef264" opacity="0.3">
                    {[...Array(16)].map((_, i) => (
                        <polygon key={i} points="50,50 100,-20 120,0" transform={`rotate(${i * 22.5} 50 50)`} />
                    ))}
                </g>
            </svg>

            {/* Comic Explosion Shape in Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] sm:w-[80vw] sm:h-[80vw] min-w-[600px] min-h-[600px] flex items-center justify-center opacity-80 animate-[pulse_4s_ease-in-out_infinite]">
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,255,0,0.5)]">
                    <path
                        d="M100 10 
                   L115 45 L150 20 L140 60 L185 55 L160 85 L195 105 L155 115 L175 160 L135 145 L120 185 L95 155 L65 190 L60 150 L20 170 L40 130 L5 110 L45 90 L10 50 L55 55 L40 15 L75 40 Z"
                        fill="#fde047"
                        stroke="#000000"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M100 25 
                   L110 50 L135 35 L125 65 L160 60 L140 85 L170 100 L135 110 L150 145 L120 135 L110 165 L90 140 L70 165 L65 135 L35 150 L50 120 L25 105 L55 90 L30 60 L60 65 L50 35 L75 50 Z"
                        fill="#fb923c"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M100 45 
                   L108 65 L120 55 L115 75 L140 70 L125 90 L145 100 L120 105 L130 125 L110 120 L105 140 L90 125 L80 140 L75 120 L55 130 L65 110 L45 100 L70 95 L50 75 L75 80 L65 60 L85 70 Z"
                        fill="#ef4444"
                    />
                </svg>
            </div>

            {/* Halftone Dot Overlay for Comic Texture */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '8px 8px'
            }}></div>
        </div>
    );
};
