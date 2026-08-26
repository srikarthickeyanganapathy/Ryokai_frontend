import React from 'react'
import { cn } from '@/shared/lib/cn'
import { RyokaiSealMark } from './RyokaiSealMark'

export function RyokaiLogo({ className, iconOnly = false, size = "md" }) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14"
  }

  const textSizes = {
    sm: "text-[14px]",
    md: "text-[18px]",
    lg: "text-[21px]",
    xl: "text-[26px]"
  }

  return (
    <div className={cn("flex items-center gap-2.5 shrink-0 select-none", className)}>
      {/* 🌌 Galaxy badge — tilted spiral around a glowing core */}
      <RyokaiSealMark
        className={cn("shrink-0", iconSizes[size] || iconSizes.md)}
        style={{ filter: 'drop-shadow(0 0 12px var(--mark-glow))' }}
      />

      {!iconOnly && (
        <span
          className={cn(
            "font-brand bg-clip-text text-transparent",
            textSizes[size] || textSizes.md
          )}
          style={{
            backgroundImage:
              'linear-gradient(92deg, var(--logo-word-1), var(--logo-word-2) 55%, var(--logo-word-3))',
          }}
        >
          Ryokai
        </span>
      )}
    </div>
  )
}
