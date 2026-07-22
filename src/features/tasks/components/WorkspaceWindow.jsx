import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Move, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

/**
 * Pure Generic Workspace Window Container Shell
 * Completely decoupled from domain logic / renderers. Simply renders children inside shell.
 */
export default function WorkspaceWindow({
  windowId,
  title,
  icon: Icon,
  badge,
  screenPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  zIndex = 50,
  dockPos = 'center',
  onClose,
  onFocus,
  onDockChange,
  children
}) {
  const [isMaximized, setIsMaximized] = useState(false)

  const isInspector = badge === 'Inspector' || title?.toLowerCase().includes('inspector')
  let widthClass = isInspector ? 'w-[640px] max-w-[calc(100vw-2.5rem)]' : 'w-[420px] max-w-[calc(100vw-2.5rem)]'
  let heightClass = isInspector ? 'h-[600px] max-h-[calc(100vh-5rem)]' : 'h-[480px] max-h-[calc(100vh-6rem)]'

  let posX = Math.max(20, (window.innerWidth - (isInspector ? 640 : 420)) / 2)
  let posY = Math.max(60, (window.innerHeight - (isInspector ? 600 : 480)) / 2)

  if (dockPos === 'right') {
    posX = window.innerWidth - (isInspector ? 660 : 440)
  } else if (dockPos === 'left') {
    posX = 24
  }

  return (
    <motion.div
      onMouseDown={onFocus}
      initial={{ 
        opacity: 0, 
        scale: 0.05, 
        x: screenPos.x - 200, 
        y: screenPos.y - 100 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: isMaximized ? 20 : posX,
        y: isMaximized ? 20 : posY,
        width: isMaximized ? window.innerWidth - 40 : undefined,
        height: isMaximized ? window.innerHeight - 40 : undefined
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.05, 
        x: screenPos.x - 200, 
        y: screenPos.y - 100 
      }}
      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      style={{ zIndex }}
      className={cn(
        "fixed bg-zinc-950/90 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col pointer-events-auto",
        !isMaximized && widthClass,
        !isMaximized && heightClass
      )}
    >
      {/* Workspace Header */}
      <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0 select-none cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
          <span className="text-xs font-semibold text-white tracking-wide">{title}</span>
          {badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-white/60">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDockChange?.(dockPos === 'right' ? 'center' : 'right')}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Snap Docking Position"
          >
            <Move size={12} />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title={isMaximized ? "Restore Window" : "Maximize Window"}
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Close Workspace Window"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Children Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 text-white text-xs">
        {children}
      </div>
    </motion.div>
  )
}
