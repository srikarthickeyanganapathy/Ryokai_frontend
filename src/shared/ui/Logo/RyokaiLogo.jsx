import React from 'react'
import { cn } from '@/shared/lib/cn'

export function RyokaiLogo({ className, iconOnly = false, size = "md" }) {
  const badgeSizes = {
    sm: "w-6 h-6",
    md: "w-7.5 h-7.5",
    lg: "w-9.5 h-9.5",
    xl: "w-12 h-12"
  }

  const iconSizes = {
    sm: "w-4.5 h-4.5",
    md: "w-5.5 h-5.5",
    lg: "w-7 h-7",
    xl: "w-9 h-9"
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-[15px]",
    lg: "text-base",
    xl: "text-xl"
  }

  return (
    <div className={cn("flex items-center gap-2.5 shrink-0 select-none", className)}>
      {/* 🌌 REALISTIC COSMIC PULSAR ACCRETION EMBLEM */}
      <div className={cn(
        "relative flex items-center justify-center rounded-2xl bg-[#030712] shadow-[0_0_16px_rgba(56,189,248,0.4)] text-white font-extrabold shrink-0 border border-sky-500/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(0,240,255,0.6)] group overflow-hidden",
        badgeSizes[size] || badgeSizes.md
      )}>
        {/* Pulsar Cosmic SVG Vector */}
        <svg viewBox="0 0 100 100" fill="none" className={cn(iconSizes[size] || iconSizes.md, "relative z-10")}>
          <defs>
            {/* Core Superdense Core Glow */}
            <radialGradient id="pulsarCoreGlowReal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#E0F2FE" />
              <stop offset="65%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </radialGradient>

            {/* Accretion Vortex Disk */}
            <radialGradient id="vortexRingReal" cx="50%" cy="50%" r="50%">
              <stop offset="35%" stopColor="#00F0FF" stopOpacity="0" />
              <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.95" />
              <stop offset="88%" stopColor="#0284C7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </radialGradient>

            {/* Diagonal Relativistic Jet Beam */}
            <linearGradient id="relativityBeamReal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.2" />
              <stop offset="45%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Swirling Galactic Accretion Disk (Tilted Ellipses) */}
          <ellipse cx="50" cy="50" rx="44" ry="24" stroke="url(#vortexRingReal)" strokeWidth="8" transform="rotate(-22 50 50)" opacity="0.9" />
          <ellipse cx="50" cy="50" rx="38" ry="20" stroke="#00F0FF" strokeWidth="2" strokeDasharray="4 5" transform="rotate(-22 50 50)" opacity="0.7" />
          <ellipse cx="50" cy="50" rx="30" ry="14" stroke="#7DD3FC" strokeWidth="3" strokeDasharray="7 3" transform="rotate(-22 50 50)" opacity="0.85" />

          {/* Starfield Particles */}
          <circle cx="15" cy="20" r="1.2" fill="#FFFFFF" opacity="0.9" />
          <circle cx="84" cy="18" r="1.5" fill="#BAE6FD" opacity="0.8" />
          <circle cx="88" cy="78" r="1.2" fill="#FFFFFF" opacity="0.7" />
          <circle cx="12" cy="82" r="1.4" fill="#7DD3FC" opacity="0.8" />
          <circle cx="36" cy="68" r="1.8" fill="#FDE047" opacity="0.95" />
          <circle cx="70" cy="35" r="1.2" fill="#FFFFFF" opacity="0.8" />

          {/* Relativistic Jet Beam (Shooting Diagonally) */}
          <line x1="22" y1="2" x2="78" y2="98" stroke="url(#relativityBeamReal)" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
          <line x1="22" y1="2" x2="78" y2="98" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

          {/* Blinding White Hot Superdense Pulsar Core */}
          <circle cx="50" cy="50" r="22" fill="url(#pulsarCoreGlowReal)" />
          <circle cx="50" cy="50" r="10" fill="#E0F2FE" />
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
        </svg>
      </div>

      {!iconOnly && (
        <span className={cn(
          "font-extrabold tracking-tight bg-gradient-to-r from-[var(--text-primary)] via-sky-400 to-cyan-400 bg-clip-text text-transparent",
          textSizes[size] || textSizes.md
        )}>
          Ryokai
        </span>
      )}
    </div>
  )
}
