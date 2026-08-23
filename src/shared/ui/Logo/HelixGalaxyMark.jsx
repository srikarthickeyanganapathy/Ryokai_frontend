import React, { useId } from 'react'

/**
 * HelixGalaxyMark — the Ryokai "Helix Galaxy" brand mark.
 *
 * A galaxy rendered purely as a cluster of dots: two spiral arms of
 * star-clusters (color-shifting from the inner to outer arm tokens),
 * a ring of knot particles, scattered field stars, and a small glowing
 * core. No thick shapes — just points of light. Colors resolve through
 * the `--logo-*` tokens, re-skinning between Dawn and Cosmic themes.
 */

// [x, y, radius, colorTier(1|2|3), opacity] — two mirrored log-spiral arms
const ARM = [
  [50.0, 43.5, 2.6, 1, 0.95],
  [47.05, 41.3, 2.44, 1, 0.91],
  [57.23, 40.57, 2.28, 1, 0.88],
  [62.11, 41.91, 2.11, 2, 0.84],
  [66.66, 45.53, 1.95, 2, 0.8],
  [69.9, 51.3, 1.79, 2, 0.76],
  [70.91, 58.66, 1.63, 3, 0.73],
  [69.03, 66.69, 1.46, 3, 0.69],
  [64.0, 74.25, 1.3, 3, 0.65],
]
const ARM_MIRROR = ARM.map(([x, y, ...rest]) => [100 - x, 100 - y, ...rest])

// Inner ring of knot particles
const KNOTS = [
  [50, 34.5], [59.11, 37.46], [64.74, 45.21], [64.74, 54.79], [59.11, 62.54],
  [50, 65.5], [40.89, 62.54], [35.26, 54.79], [35.26, 45.21], [40.89, 37.46],
]

// Scattered field stars [x, y, r, fill, opacity]
const STARS = [
  [76, 38, 1.1, 'var(--logo-glint)', 0.6],
  [24, 60, 1.0, 'var(--logo-star-2)', 0.55],
  [63, 20, 0.9, 'var(--logo-star-1)', 0.7],
  [33, 80, 0.8, 'var(--logo-glint)', 0.5],
]

const TIER_COLORS = ['var(--logo-arm-1)', 'var(--logo-arm-2)', 'var(--logo-arm-3)']

export function HelixGalaxyMark({ className, style }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const glow = `hx-glow-${uid}`

  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--logo-core-glow)" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="var(--logo-core-glow)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--logo-core-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Inner knot ring */}
      {KNOTS.map(([x, y], i) => (
        <circle key={`k${i}`} cx={x} cy={y} r="0.95" fill="var(--logo-tick)" opacity="0.35" />
      ))}

      {/* Spiral arms — clusters of stars */}
      {[...ARM, ...ARM_MIRROR].map(([x, y, r, tier, op], i) => (
        <circle key={`a${i}`} cx={x} cy={y} r={r} fill={TIER_COLORS[tier - 1]} opacity={op} />
      ))}

      {/* Field stars */}
      {STARS.map(([x, y, r, fill, op], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r={r} fill={fill} opacity={op} />
      ))}

      {/* Glowing core */}
      <circle cx="50" cy="50" r="13" fill={`url(#${glow})`} />
      <circle cx="50" cy="50" r="4.4" fill="var(--logo-core)" />
      <circle cx="47.8" cy="47.6" r="1.5" fill="var(--logo-glint)" opacity="0.95" />
    </svg>
  )
}
