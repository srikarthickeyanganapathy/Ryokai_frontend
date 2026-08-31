import React from 'react'
import { FolderKanban, Users, Compass, User, ArrowUpRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import './entity-card.css'

const TYPE_ICON = {
  project: FolderKanban,
  team: Users,
  crew: Compass,
  discover: Compass,
  member: User,
}

const TYPE_TONE = {
  project: 'cyan',
  team: 'amber',
  crew: 'emerald',
  discover: 'rose',
  member: 'accent',
}

const TONE_STYLE = {
  cyan: { color: 'var(--ec-cyan, #38bdf8)', background: 'var(--ec-cyan-soft, rgba(56,189,248,.14))' },
  amber: { color: 'var(--ec-amber, #fbbf24)', background: 'var(--ec-amber-soft, rgba(251,191,36,.14))' },
  emerald: { color: 'var(--ec-emerald, #34d399)', background: 'var(--ec-emerald-soft, rgba(52,211,153,.14))' },
  rose: { color: 'var(--ec-rose, #fb7185)', background: 'var(--ec-rose-soft, rgba(251,113,133,.14))' },
  accent: { color: 'var(--accent)', background: 'var(--accent-soft)' },
}

/**
 * EntityCard -- one card UI for every entity (project / team / crew / discover / member).
 * Data-driven anatomy: glyph tile   badges   name   tagline   orbital meta   avatars  
 * constellation progress   footer slots. Feature slots: `actions` (top-right),
 * `footer`, `badges`, `glyph` (override), `avatars`, `progress`.
 * WIRE: click handlers / navigation stay owned by the caller -- pass `onClick`.
 */
export function EntityCard({
  type = 'project',
  name,
  tagline,
  glyph,
  badges = [],
  meta = [],
  avatars = [],
  avatarOverflow,
  progress,
  progressLabel,
  footer,
  actions,
  onClick,
  selected,
  disabled,
  showArrow = false,
  className,
  style,
  ...rest
}) {
  const Icon = TYPE_ICON[type] || FolderKanban
  const tone = TONE_STYLE[TYPE_TONE[type] || 'accent']
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e) }
  }
  return (
    <article
      data-type={type}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={name ? `Open ${name}` : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKey : undefined}
      className={cn(
        'ec-card',
        selected && 'ec-card--selected',
        disabled && 'ec-card--disabled',
        className,
      )}
      style={style}
      {...rest}
    >
      <div className="ec-card-top">
        <div className="ec-glyph" style={tone}>
          {glyph ?? <Icon />}
        </div>
        <div className="ec-badges">
          {badges}
          {actions}
        </div>
      </div>
      <div className="ec-card-body">
        <div className={cn('ec-name', showArrow && 'ec-name--arrow')}>
          {name}
          {showArrow && <ArrowUpRight />}
        </div>
        {tagline && <p className="ec-tagline">{tagline}</p>}
        {(meta.length > 0 || avatars.length > 0) && (
          <div className="ec-meta">
            {avatars.length > 0 && (
              <div className="ec-avatars">
                {avatars.map((a, i) => (
                  <span
                    key={i}
                    className={cn('ec-av', a.lg && 'ec-av--lg')}
                    title={a.title}
                    style={{ background: a.color || 'var(--bg-hover-strong)' }}
                  >
                    {a.initials}
                  </span>
                ))}
                {avatarOverflow > 0 && (
                  <span className="ec-av ec-av--more">{`+${avatarOverflow}`}</span>
                )}
              </div>
            )}
            {meta.map((m, i) => (
              <span key={i} className="ec-meta-item">
                {m.icon}
                <b>{m.text}</b>
              </span>
            ))}
          </div>
        )}
      </div>
      {footer ??
        (progress != null && (
          <div className="ec-card-foot">
            <div className="ec-progress">
              <div className="ec-track">
                <div className="ec-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
              </div>
              <span className="ec-pct">{progressLabel ?? `${Math.round(progress)}%`}</span>
            </div>
          </div>
        ))}
    </article>
  )
}

export default EntityCard
