import React, { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * GalaxyCanvas -- a 3D-look spiral galaxy rendered on canvas.
 *
 * Thousands of glow-sprite particles ride logarithmic spiral arms with
 * differential rotation (inner orbits faster, like a real disk galaxy),
 * projected onto a tilted plane with a bulging core and soft halo.
 *
 * `spinKey` changes (e.g. every carousel step) add angular momentum that
 * decays back to the ambient drift, so the galaxy visibly reacts to the UI.
 * Palettes track the Dawn/Cosmic theme via the `dark` class.
 */

const TILT = Math.cos((58 * Math.PI) / 180) // disk flattening (inclination)
const ARMS = 3
const TWIST = 2.7 // radians of spiral wind-out from core to rim
const AMBIENT_OMEGA = 0.00006 // rad/ms baseline drift
const STEP_IMPULSE = 1.5 // rad of spin added per spinKey change

const PALETTES = {
  dark: {
    core: '#FFFFFF',
    inner: '#FFE3A8',
    arms: ['#A78BFA', '#7DD3FC', '#5EEAD4'],
    spark: '#E8C468',
    halo: [125, 211, 252],
  },
  light: {
    core: '#FFF7ED',
    inner: '#F5C453',
    arms: ['#D1477A', '#F2724A', '#F5A623'],
    spark: '#C6952F',
    halo: [242, 114, 74],
  },
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

/** Soft radial glow sprite: hot white-ish center fading through the arm color. */
function makeSprite(hex, coreHex) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const [r, gg, b] = hexToRgb(hex)
  const [cr, cg, cb] = hexToRgb(coreHex)
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, `rgba(${cr},${cg},${cb},1)`)
  grad.addColorStop(0.22, `rgba(${r},${gg},${b},0.9)`)
  grad.addColorStop(0.55, `rgba(${r},${gg},${b},0.28)`)
  grad.addColorStop(1, `rgba(${r},${gg},${b},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return c
}

function gauss() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
}

export function GalaxyCanvas({ spinKey, density = 2600, className, style }) {
  const canvasRef = useRef(null)
  const boostRef = useRef(0)

  // Every carousel step injects angular momentum.
  useEffect(() => {
    if (spinKey !== undefined) boostRef.current += STEP_IMPULSE
  }, [spinKey])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = 0, H = 0, cx = 0, cy = 0, R = 0
    let sprites = null
    let palRgb = null
    let spritePalette = null
    let spin = Math.random() * Math.PI * 2
    let last = performance.now()
    let raf = 0

    const particles = Array.from({ length: density }, (_, i) => {
      const t = Math.pow(Math.random(), 1.6) // bias density toward the core
      let r = 0.1 + t * 0.9 + gauss() * 0.03
      r = Math.min(Math.max(r, 0.06), 1)
      const arm = i % ARMS
      const a = arm * ((Math.PI * 2) / ARMS) + r * TWIST + gauss() * (0.16 + 0.14 * (1 - r))
      const big = Math.random() < 0.025
      return {
        r,
        a,
        w: 1 / (0.28 + r * 1.15), // differential rotation: inner stars sweep faster
        size: big ? 3.4 + Math.random() * 2.6 : 0.9 + Math.random() * 1.8,
        alpha: (big ? 0.6 : 0.22 + Math.random() * 0.38) * (1.12 - r * 0.45),
        twS: 0.0006 + Math.random() * 0.0018,
        twP: Math.random() * Math.PI * 2,
        bulge: gauss() * 10 * Math.max(0, 1.05 - r), // central thickness of the disk
        kind: r < 0.15 ? 'core' : r < 0.3 ? 'inner' : Math.random() < 0.06 ? 'spark' : `arm${arm}`,
      }
    })

    const ensureSprites = (pal) => {
      if (pal === spritePalette) return
      spritePalette = pal
      palRgb = { core: hexToRgb(pal.core), inner: hexToRgb(pal.inner), halo: pal.halo }
      sprites = {
        core: makeSprite(pal.inner, pal.core),
        inner: makeSprite(pal.inner, pal.core),
        arm0: makeSprite(pal.arms[0], pal.core),
        arm1: makeSprite(pal.arms[1], pal.core),
        arm2: makeSprite(pal.arms[2], pal.core),
        spark: makeSprite(pal.spark, pal.core),
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = Math.max(1, Math.round(W * dpr))
      canvas.height = Math.max(1, Math.round(H * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = W / 2
      cy = H / 2
      R = Math.min(W * 0.48, H * 1.05)
    }

    const drawFrame = (now, dt) => {
      const pal = document.documentElement.classList.contains('dark') ? PALETTES.dark : PALETTES.light
      ensureSprites(pal)

      const boost = boostRef.current
      spin += (AMBIENT_OMEGA + boost) * dt
      boostRef.current = boost * Math.exp(-dt / 600)

      ctx.clearRect(0, 0, W, H)

      // Wide halo
      const [hr, hg, hb] = palRgb.halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.05)
      halo.addColorStop(0, `rgba(${hr},${hg},${hb},0.08)`)
      halo.addColorStop(1, `rgba(${hr},${hg},${hb},0)`)
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, W, H)

      // Bulging core
      const [cr, cg, cb] = palRgb.core
      const [ir, ig, ib] = palRgb.inner
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22)
      coreGlow.addColorStop(0, `rgba(${cr},${cg},${cb},0.65)`)
      coreGlow.addColorStop(0.35, `rgba(${ir},${ig},${ib},0.26)`)
      coreGlow.addColorStop(1, `rgba(${ir},${ig},${ib},0)`)
      ctx.fillStyle = coreGlow
      ctx.fillRect(0, 0, W, H)

      // Spiral arm particles
      for (const p of particles) {
        const ang = p.a + spin * p.w
        const x = cx + Math.cos(ang) * p.r * R
        const y = cy + Math.sin(ang) * p.r * R * TILT + p.bulge
        const tw = 0.62 + 0.38 * Math.sin(now * p.twS + p.twP)
        const s = p.size * (1 + p.r * 0.35)
        ctx.globalAlpha = Math.min(1, p.alpha * tw)
        ctx.drawImage(sprites[p.kind], x - s / 2, y - s / 2, s, s)
      }
      ctx.globalAlpha = 1
    }

    if (reduced) {
      // Static render for reduced-motion users
      resize()
      const drawStatic = () => drawFrame(performance.now(), 16)
      drawStatic()
      const onResize = () => { resize(); drawStatic() }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    const loop = (now) => {
      const dt = Math.min(now - last, 50)
      last = now
      drawFrame(now, dt)
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(loop)

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [density])

  return <canvas ref={canvasRef} className={cn('pointer-events-none', className)} style={style} aria-hidden="true" />
}
