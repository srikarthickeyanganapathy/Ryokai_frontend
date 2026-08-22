import React, { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { cn } from '@/shared/lib/cn'

/**
 * CardFanCarousel — an arc of overlapping cards that fan out from a center
 * card. Cards carry real content (image + title + body), cycle with arrows /
 * dots, and gently auto-advance unless the user is hovering.
 *
 * Adapted from a GSAP-based shadcn fan carousel; positions use the proven
 * FAN_POSITIONS math, while responsiveness is measured from the container
 * (not the window) so it fits inside panels like the auth brand side.
 */

const MAX_VISIBLE = 7
const HALF = 3

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
]

// Width here is the CONTAINER width (e.g. a 42% auth panel), not the viewport.
function getResponsiveMultiplier(width) {
  if (width < 340) return 0.3
  if (width < 480) return 0.38
  if (width < 640) return 0.5
  if (width < 900) return 0.7
  return 1.0
}

/**
 * Scales y-offsets and entry distances when the viewport is too short for
 * the ideal layout height.
 */
function getHeightMultiplier(width) {
  let idealPx
  if (width < 480) idealPx = 22 * 16
  else if (width < 640) idealPx = 26 * 16
  else if (width < 768) idealPx = 28 * 16
  else idealPx = 32 * 16

  const available = window.innerHeight * 0.7
  if (available >= idealPx) return 1
  return available / idealPx
}

function getSlotConfig(totalCards, slot) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot]
  const center = totalCards >> 1
  const distance = totalCards > 1 ? (slot - center) / center : 0
  const absDistance = Math.abs(distance)
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  }
}

const ARROW_CLASSES =
  'relative flex items-center justify-center rounded-full border-[1.5px] border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-tertiary)] cursor-pointer shrink-0 z-30 outline-none shadow-sm hover:border-[var(--accent-border)] hover:text-[var(--accent)] active:opacity-70 transition-colors duration-300'

function CardFace({ card }) {
  const Icon = card.icon
  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg,1rem)] shadow-[var(--shadow-lg)] overflow-hidden">
      {/* Image band with gradient fallback so it still looks right offline */}
      <div
        className="relative h-[46%] shrink-0 overflow-hidden"
        style={{ background: card.gradient || 'linear-gradient(135deg, var(--accent-soft), var(--bg-subtle))' }}
      >
        {card.imgUrl && (
          <img
            src={card.imgUrl}
            loading="lazy"
            alt={card.alt || card.title || 'Card'}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        {Icon && (
          <div className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center">
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        )}
      </div>
      {/* Info band — the valuable part */}
      <div className="flex-1 min-h-0 p-4 flex flex-col gap-1.5 text-left">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
          {card.title}
        </p>
        <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed line-clamp-4">
          {card.body}
        </p>
        {card.footer && (
          <p className="mt-auto pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            {card.footer}
          </p>
        )}
      </div>
    </div>
  )
}

export default function CardFanCarousel({ cards = [], autoPlay = true, autoPlayMs = 7000, className }) {
  const containerRef = useRef(null)
  const isAnimating = useRef(false)
  const hasEntered = useRef(false)
  const isHovering = useRef(false)
  const directionRef = useRef(null)
  const prevVisible = useRef(new Set())

  const totalCards = cards.length
  const needsPagination = totalCards > MAX_VISIBLE
  const [centerIndex, setCenterIndex] = useState(needsPagination ? HALF : totalCards >> 1)

  const getVisibleMap = useCallback((center) => {
    const map = new Map()
    if (!needsPagination) {
      cards.forEach((_, i) => map.set(i, i))
      return map
    }
    for (let slot = 0; slot < MAX_VISIBLE; slot++) {
      map.set(((center + slot - HALF) % totalCards + totalCards) % totalCards, slot)
    }
    return map
  }, [totalCards, needsPagination, cards])

  const cycle = useCallback((direction) => {
    if (isAnimating.current || !needsPagination) return
    isAnimating.current = true
    directionRef.current = direction
    setCenterIndex(prev =>
      direction === 'right' ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
    )
  }, [totalCards, needsPagination])

  // Gentle auto-advance; pauses while the user inspects a card.
  useEffect(() => {
    if (!autoPlay || !needsPagination) return
    const t = setInterval(() => {
      if (!isHovering.current) cycle('right')
    }, autoPlayMs)
    return () => clearInterval(t)
  }, [autoPlay, autoPlayMs, needsPagination, cycle])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !totalCards) return

    const cardElements = Array.from(container.querySelectorAll('.fan-card'))
    if (!cardElements.length) return

    const containerWidth = container.offsetWidth
    const visibleMap = getVisibleMap(centerIndex)
    const previouslyVisible = prevVisible.current
    const direction = directionRef.current
    const isFirstMount = !hasEntered.current
    const multiplier = getResponsiveMultiplier(containerWidth)
    const hMult = getHeightMultiplier(containerWidth)
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards
    const config = (slot) => getSlotConfig(slotCount, slot)

    if (isFirstMount) isAnimating.current = true

    let completedCount = 0
    const visibleCount = visibleMap.size
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false
        if (isFirstMount) hasEntered.current = true
      }
    }

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex)
      const wasVisible = previouslyVisible.has(cardIndex)

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot)
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        }

        if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 })
          gsap.to(card, { ...target, duration: 1.2, ease: 'elastic.out(1.05,.78)', delay: 0.2 + slot * 0.06, onComplete: onCardDone })
        } else if (!wasVisible) {
          const enterX = direction === 'right' ? 40 : -40
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === 'right' ? 30 : -30, scale: 0.5, opacity: 0 })
          gsap.to(card, { ...target, duration: 0.6, ease: 'power2.out', onComplete: onCardDone })
        } else {
          gsap.to(card, { ...target, duration: 0.5, ease: 'power2.out', onComplete: onCardDone })
        }
      } else if (wasVisible) {
        const exitX = direction === 'right' ? -40 : 40
        gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === 'right' ? -30 : 30, duration: 0.4, ease: 'power2.in', zIndex: 0 })
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 })
      }
    })

    prevVisible.current = new Set(visibleMap.keys())

    // Hover interactions
    const visibleEntries = []
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i)
      if (slot !== undefined) visibleEntries.push({ el, slot })
    })
    visibleEntries.sort((a, b) => a.slot - b.slot)

    let activeSlot = null
    let leaveTimer = null
    const centerSlot = visibleEntries.length >> 1

    const updateHoverLayout = (hoveredSlot) => {
      const mult = getResponsiveMultiplier(container.offsetWidth)
      const hM = getHeightMultiplier(container.offsetWidth)

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot)
        let targetX = base.x * mult
        let targetY = base.y * hM
        let targetRot = base.rot
        let targetScale = base.scale
        let delay = 0

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot)
          delay = distance * 0.02

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM
            targetScale *= 1.08
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0
            const pushStrength = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance))

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult
              targetRot -= 3 / (distance + 1)
            } else {
              targetX += pushStrength * mult
              targetRot += 3 / (distance + 1)
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02
        }

        gsap.to(el, {
          x: `${targetX}rem`, y: `${targetY}rem`, rotation: targetRot, scale: targetScale,
          duration: 0.5, delay, ease: 'elastic.out(1,.75)', overwrite: 'auto',
        })
        gsap.set(el, { zIndex: base.zIndex })
      })
    }

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        isHovering.current = true
        if (isAnimating.current) return
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null }
        if (activeSlot !== slot) { activeSlot = slot; updateHoverLayout(slot) }
      }
      el.addEventListener('mouseenter', handler)
      return { el, handler }
    })

    const onMouseLeave = () => {
      isHovering.current = false
      if (isAnimating.current) return
      if (leaveTimer) clearTimeout(leaveTimer)
      leaveTimer = setTimeout(() => { activeSlot = null; updateHoverLayout(null) }, 50)
    }
    container.addEventListener('mouseleave', onMouseLeave)

    const onResize = () => { if (!isAnimating.current) updateHoverLayout(activeSlot) }
    window.addEventListener('resize', onResize)

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener('mouseenter', handler))
      container.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      if (leaveTimer) clearTimeout(leaveTimer)
    }
  }, [centerIndex, totalCards, getVisibleMap, needsPagination])

  if (!totalCards) return null

  const chevron = (direction) => (
    <svg className="relative z-[2] w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )

  return (
    <section className={cn('flex flex-col items-center w-full relative z-20', className)}>
      <div className="flex items-center justify-center w-full">
        <div ref={containerRef} className="fan-layout flex relative justify-center items-center w-full">
          {cards.map((card, index) => (
            card.linkUrl ? (
              <a
                key={index}
                href={card.linkUrl}
                target={card.linkUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="fan-card block cursor-pointer"
              >
                <CardFace card={card} />
              </a>
            ) : (
              <div key={index} className="fan-card">
                <CardFace card={card} />
              </div>
            )
          ))}
        </div>
      </div>

      {needsPagination && (
        <div className="flex items-center justify-center gap-4 mt-3 z-30">
          <button className={`${ARROW_CLASSES} w-9 h-9`} onClick={() => cycle('left')} aria-label="Previous">
            {chevron('left')}
          </button>
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === centerIndex
                    ? 'bg-[var(--accent)] scale-[1.3]'
                    : 'bg-[var(--border-strong)] hover:bg-[var(--text-tertiary)]'
                )}
              />
            ))}
          </div>
          <button className={`${ARROW_CLASSES} w-9 h-9`} onClick={() => cycle('right')} aria-label="Next">
            {chevron('right')}
          </button>
        </div>
      )}
    </section>
  )
}
