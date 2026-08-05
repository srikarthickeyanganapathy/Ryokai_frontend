import React from 'react'
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, ChevronRight, LogOut, Compass, Eye, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

export default function NebulaHud({
  totalNodes,
  visibleNodes,
  selectedTask,
  activeOrbitPanel,
  onResetView,
  onZoomIn,
  onZoomOut,
  isAutoRotating,
  onToggleAutoRotate,
  onExitNebula,
  onOpenInspector,
  onOpenAnalyze
}) {
  return (
    <>
      {/* Top Right Minimal Controls Toolbar */}
      <div className="absolute top-5 right-5 z-40 flex flex-col items-center gap-1.5 select-none">
        <div className="flex flex-col bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <button
            onClick={onZoomIn}
            className="p-2.5 hover:bg-white/10 transition-colors text-white/60 hover:text-white border-b border-white/5 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={onZoomOut}
            className="p-2.5 hover:bg-white/10 transition-colors text-white/60 hover:text-white border-b border-white/5 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={onResetView}
            className="p-2.5 hover:bg-white/10 transition-colors text-white/60 hover:text-white border-b border-white/5 cursor-pointer"
            title="Reset Framing"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={onToggleAutoRotate}
            className={cn(
              "p-2.5 transition-colors cursor-pointer",
              isAutoRotating ? "bg-cyan-500/25 text-cyan-300" : "hover:bg-white/10 text-white/60 hover:text-white"
            )}
            title={isAutoRotating ? "Pause Orbit" : "Slow Orbit"}
          >
            <RotateCcw size={14} className={isAutoRotating ? "animate-spin" : ""} />
          </button>
        </div>

        <button
          onClick={onExitNebula}
          className="p-2.5 bg-black/40 hover:bg-rose-500/20 backdrop-blur-3xl border border-white/10 hover:border-rose-500/40 rounded-2xl text-white/60 hover:text-rose-300 transition-all shadow-lg cursor-pointer"
          title="Exit Constellation"
        >
          <LogOut size={14} />
        </button>
      </div>

      {/* Bottom Left Minimal Breadcrumb with Inspect Details Action */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute bottom-5 left-5 z-30 flex items-center gap-2.5 bg-black/40 backdrop-blur-3xl border border-white/10 px-3.5 py-1.5 rounded-xl text-xs text-white/70 font-mono select-none shadow-xl"
          >
            <Compass size={13} className="text-cyan-400" />
            <span className="text-white/40">Constellation</span>
            <ChevronRight size={11} className="text-white/30" />
            <span className="text-white font-medium truncate max-w-[200px]">{selectedTask.title}</span>

            {onOpenAnalyze && (
              <button
                type="button"
                onClick={onOpenAnalyze}
                className="ml-1.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-500/40 text-cyan-200 transition-colors text-[11px] font-semibold cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <Search size={12} />
                <span>Analyze</span>
              </button>
            )}

            {onOpenInspector && (
              <button
                type="button"
                onClick={onOpenInspector}
                className="ml-1 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 transition-colors text-[11px] font-semibold cursor-pointer"
              >
                <Eye size={12} />
                <span>Task Context</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
