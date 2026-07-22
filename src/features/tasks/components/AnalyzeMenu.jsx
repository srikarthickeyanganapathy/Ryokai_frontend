import React, { useEffect, useRef } from 'react'
import { Network, Zap, Globe, Target, Clock, Waves } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const ANALYSIS_MODES = [
  { id: 'dependency', label: 'Dependencies', icon: Network, color: '#f43f5e', angle: 0 },
  { id: 'impact', label: 'Impact', icon: Zap, color: '#10b981', angle: 60 },
  { id: 'relationship', label: 'Relationships', icon: Globe, color: '#a855f7', angle: 120 },
  { id: 'execution', label: 'Readiness', icon: Target, color: '#3b82f6', angle: 180 },
  { id: 'history', label: 'Timeline', icon: Clock, color: '#fbbf24', angle: 240 },
  { id: 'flow', label: 'Flow', icon: Waves, color: '#06b6d4', angle: 300 }
]

export default function AnalyzeMenu({ position, onSelect, onClose }) {
  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.()
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  if (!position) return null

  const RADIUS = 80

  return (
    <div
      ref={menuRef}
      className="fixed z-50 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Center glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 animate-pulse" />
      </div>

      {/* Radial buttons */}
      {ANALYSIS_MODES.map((mode, idx) => {
        const angleRad = (mode.angle - 90) * (Math.PI / 180)
        const x = Math.cos(angleRad) * RADIUS
        const y = Math.sin(angleRad) * RADIUS
        const Icon = mode.icon

        return (
          <button
            key={mode.id}
            onClick={() => {
              onSelect?.(mode.id)
              onClose?.()
            }}
            className="absolute flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer group"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animation: `nebula-analyze-pop 0.3s ease-out ${idx * 0.05}s both`
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-125 border shadow-lg"
              style={{
                backgroundColor: `${mode.color}20`,
                borderColor: `${mode.color}50`,
                boxShadow: `0 0 20px ${mode.color}30`
              }}
            >
              <Icon size={16} style={{ color: mode.color }} />
            </div>
            <span className="text-[10px] text-white/60 font-medium group-hover:text-white transition-colors whitespace-nowrap">
              {mode.label}
            </span>
          </button>
        )
      })}

      {/* Animation keyframes */}
      <style>{`
        @keyframes nebula-analyze-pop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  )
}
