import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

import React, { useRef, useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { useRealtime } from '@/app/providers/RealTimeProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { saveSnapshot } from '../api/whiteboard.api'

const COLORS = ['#ffffff', '#f87171', '#fbbf24', '#4ade80', '#60a5fa', '#c084fc']
const SNAPSHOT_INTERVAL_MS = 10000

export function WhiteboardCanvas({ crewId, boardId, initialSnapshot }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const drawing = useRef(false)
  const currentStroke = useRef([])
  const lastSentIndex = useRef(0)
  const hasUnsavedChanges = useRef(false)
  const { publish, subscribeToTopic, connected } = useRealtime()
  const { user } = useAuth()

  const [color, setColor] = useState(COLORS[0])
  const [strokeWidth, setStrokeWidth] = useState(3)

  // Setup canvas + load durability snapshot
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set actual canvas resolution to match display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (canvas.width === rect.width && canvas.height === rect.height) return

      // Cache the existing canvas content before resizing clears it
      const snapshot = canvas.width > 0 && canvas.height > 0 ? canvas.toDataURL() : null

      canvas.width = rect.width
      canvas.height = rect.height

      const ctx = canvas.getContext('2d')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctxRef.current = ctx

      // Restore the drawing
      if (snapshot) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0)
        img.src = snapshot
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    if (initialSnapshot) {
      const ctx = ctxRef.current
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = initialSnapshot
    }
    
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [initialSnapshot])

  // Subscribe to remote draw events
  useEffect(() => {
    if (!connected || !subscribeToTopic) return
    const unsubscribe = subscribeToTopic(`/topic/whiteboards/${boardId}`, (event) => {
      if (event.username === user?.username) return // don't redraw our own strokes
      if (event.type === 'clear') {
        clearCanvas()
        hasUnsavedChanges.current = true
      } else {
        drawRemoteStroke(event)
        hasUnsavedChanges.current = true
      }
    })
    return unsubscribe
  }, [connected, boardId, user?.username, subscribeToTopic])

  // Periodic durability snapshot
  useEffect(() => {
    const interval = setInterval(() => {
      if (canvasRef.current && hasUnsavedChanges.current) {
        hasUnsavedChanges.current = false
        const dataUrl = canvasRef.current.toDataURL('image/png')
        saveSnapshot(crewId, boardId, dataUrl).catch(() => {})
      }
    }, SNAPSHOT_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [crewId, boardId])

  const drawRemoteStroke = (event) => {
    const ctx = ctxRef.current
    if (!event.points || event.points.length < 2) return
    ctx.strokeStyle = event.color
    ctx.lineWidth = event.strokeWidth
    ctx.beginPath()
    ctx.moveTo(event.points[0][0], event.points[0][1])
    event.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y))
    ctx.stroke()
  }

  const clearCanvas = () => {
    const ctx = ctxRef.current
    if (!ctx || !canvasRef.current) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  const handlePointerDown = (e) => {
    drawing.current = true
    currentStroke.current = [getPos(e)]
    lastSentIndex.current = 0
  }

  const handlePointerMove = (e) => {
    if (!drawing.current) return
    const pos = getPos(e)
    currentStroke.current.push(pos)

    const ctx = ctxRef.current
    const prev = currentStroke.current[currentStroke.current.length - 2]
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.beginPath()
    ctx.moveTo(prev[0], prev[1])
    ctx.lineTo(pos[0], pos[1])
    ctx.stroke()

    // Throttle: publish every 4th point rather than every pointermove
    // event, to avoid flooding the broker while a user drags fast.
    if (currentStroke.current.length - lastSentIndex.current >= 4) {
      const startIndex = lastSentIndex.current > 0 ? lastSentIndex.current - 1 : 0
      const segment = currentStroke.current.slice(startIndex)
      lastSentIndex.current = currentStroke.current.length
      publish(`/app/whiteboards/${boardId}/draw`, {
        type: 'stroke', points: segment, color, strokeWidth,
      })
    }
  }

  const handlePointerUp = () => {
    if (!drawing.current) return
    drawing.current = false
    hasUnsavedChanges.current = true
    // Flush any remaining unsent points from this stroke.
    const startIndex = lastSentIndex.current > 0 ? lastSentIndex.current - 1 : 0
    const remaining = currentStroke.current.slice(startIndex)
    if (remaining.length >= 2) {
      publish(`/app/whiteboards/${boardId}/draw`, {
        type: 'stroke', points: remaining, color, strokeWidth,
      })
    }
    currentStroke.current = []
  }

  const handleClear = () => {
    clearCanvas()
    hasUnsavedChanges.current = true
    publish(`/app/whiteboards/${boardId}/draw`, { type: 'clear' })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Floating Toolbar Palette */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 bg-[var(--bg-elevated)]/90 backdrop-blur-xl border border-[var(--color-border-subtle)] rounded-full shadow-2xl">
        {/* Color Swatches */}
        <div className="flex items-center gap-2 pr-3 border-r border-[var(--color-border-subtle)]">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-6 h-6 rounded-full transition-transform duration-200 hover:scale-110",
                color === c ? "ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--bg-elevated)] scale-110" : "opacity-80 hover:opacity-100"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Stroke Size Presets */}
        <div className="flex items-center gap-1 pr-3 border-r border-[var(--color-border-subtle)]">
          {[2, 4, 8].map(w => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-mono rounded-full font-semibold transition-all",
                strokeWidth === w ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              )}
            >
              {w}px
            </button>
          ))}
        </div>

        {/* Clear Board Action */}
        <Button 
          variant="ghost" 
          size="xs" 
          onClick={handleClear} 
          className="text-xs text-[var(--danger)] hover:bg-rose-500/10 hover:text-rose-500 rounded-full px-3"
        >
          Clear Canvas
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        className="flex-1 w-full bg-[var(--bg-base)] touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  )
}
