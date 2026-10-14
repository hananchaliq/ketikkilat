'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function BrandLogo({
  size = 32,
  className = '',
  showText = false,
  textClassName = '',
}: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* 
        KetikKilat Authentic Brand Logo:
        A bespoke fusion of a precision mechanical keycap with an angular typographic 'K' lightning strike.
        Anti-AI slop: Designed with strict geometric vector coordinates, subtle keycap bevel depth, and sharp dynamic terminals.
      */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
        aria-label="KetikKilat Logo"
      >
        <defs>
          {/* Keycap base gradient */}
          <linearGradient id="kk-keycap-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Keycap inner face gradient */}
          <linearGradient id="kk-face-grad" x1="10" y1="8" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Lightning strike gold highlight */}
          <linearGradient id="kk-bolt-grad" x1="20" y1="12" x2="38" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Outer Keycap Body (with chamfered mechanical keyboard slope) */}
        <rect x="4" y="4" width="40" height="40" rx="9" fill="url(#kk-keycap-grad)" />
        <rect x="4" y="4" width="40" height="40" rx="9" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity="0.4" />

        {/* Top Keycap Dish / Inset Face */}
        <rect x="8" y="7" width="32" height="30" rx="6" fill="url(#kk-face-grad)" />
        <path d="M8 13C8 9.68629 10.6863 7 14 7H34C37.3137 7 40 9.68629 40 13V14H8V13Z" fill="white" fillOpacity="0.12" />

        {/* 
          Bespoke 'K' Monogram + Kilat (Lightning) Bolt:
          Vertical Stem: x=14 to 19, y=13 to 35
          Upper Arm: x=19, y=23 to x=32, y=14
          Lower Arm / Lightning Strike: Sharp zig-zag cutting downward to x=33, y=36
        */}
        {/* Vertical Keycap Stem */}
        <path
          d="M15 14C15 13.4477 15.4477 13 16 13H19C19.5523 13 20 13.4477 20 14V34C20 34.5523 19.5523 35 19 35H16C15.4477 35 15 34.5523 15 34V14Z"
          fill="white"
        />

        {/* Upper Arm of 'K' */}
        <path
          d="M19 21.5L28.5 13.5C29.1 13 30 13.45 30 14.25V17.2C30 17.65 29.75 18.05 29.35 18.25L23 23.5L19 21.5Z"
          fill="white"
        />

        {/* Lower Arm: Dynamic Kilat (Lightning) Strike */}
        <path
          d="M21 21.5L31.5 28.5H26.5L30.5 35.5L19 26H24.5L21 21.5Z"
          fill="url(#kk-bolt-grad)"
          filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.25))"
        />
      </svg>

      {showText && (
        <span className={`text-base font-extrabold tracking-tight font-sans ${textClassName}`}>
          Ketik<span className="text-[var(--color-accent)]">Kilat</span>
        </span>
      )}
    </div>
  );
}
