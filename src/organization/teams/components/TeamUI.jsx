import React from 'react';
import { cn } from '@/shared/lib/cn';
import { Users } from '@/shared/ui/Icons';
export function hashHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}
export function TeamAvatar({ name, size = 'md', className, showGlow = true }) {
  const hue = hashHue(name || '?');
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-16 h-16 text-2xl',
  };
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0 transition-transform duration-300 group-hover:scale-105 border border-white/10',
        sizes[size] || sizes.md,
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${(hue + 35) % 360} 68% 38%))`,
        boxShadow: showGlow ? `0 4px 14px -2px hsl(${hue} 75% 50% / 0.35)` : '0 2px 4px rgba(0,0,0,0.1)',
      }}
      title={name}
      aria-hidden="true"
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}
export function MemberAvatar({ username, size = 'md', isOnline = false, className }) {
  const hue = hashHue(username || '?');
  const nameStr = username || 'Member';
  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  };
  return (
    <div className={cn("relative inline-flex shrink-0", className)} title={nameStr}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white shadow-xs border border-white/10",
          sizes[size] || sizes.md
        )}
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 65% 50%), hsl(${(hue + 35) % 360} 60% 38%))`
        }}
      >
        {nameStr.charAt(0).toUpperCase()}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-card)] shadow-xs" />
      )}
    </div>
  );
}
export function MemberAvatarStack({ members = [], max = 4 }) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;
  if (members.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] italic">
        <Users className="w-3.5 h-3.5 opacity-60" />
        <span>No active roster</span>
      </div>
    );
  }
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 overflow-hidden p-0.5">
        {visible.map((m, i) => {
          const hue = hashHue(m.username || m.name || String(i));
          const nameStr = m.username || m.name || 'Member';
          return (
            <div
              key={m.id ?? m.userId ?? i}
              title={nameStr}
              className="relative group/avatar cursor-pointer transition-transform duration-150 hover:scale-110 hover:z-30"
              style={{ zIndex: visible.length - i }}
            >
              <div
                className="w-7 h-7 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 50%), hsl(${(hue + 35) % 360} 60% 40%))` }}
              >
                {nameStr.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[var(--bg-card)]" />
            </div>
          );
        })}
        {overflow > 0 && (
          <div
            title={`${overflow} more teammates`}
            className="w-7 h-7 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] shadow-sm shrink-0"
            style={{ zIndex: 0 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}
export function RadialProgressRing({ progress = 0, size = 48, strokeWidth = 4, hue = 230 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedProgress = Math.min(100, Math.max(0, isNaN(progress) ? 0 : progress));
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center shrink-0 group/ring" style={{ width: size, height: size }} title={`Task Completion: ${Math.round(normalizedProgress)}%`}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xs">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`hsl(${hue} 75% 52%)`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
          {Math.round(normalizedProgress)}%
        </span>
      </div>
    </div>
  );
}

export function MetricChip({ icon: Icon, label, value, colorClass, borderClass, bgClass }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors shadow-2xs",
      bgClass || "bg-[var(--bg-subtle)]/70",
      borderClass || "border-[var(--border-subtle)]",
      colorClass || "text-[var(--text-secondary)]"
    )}>
      {Icon && <Icon className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />}
      <span className="font-bold text-[var(--text-primary)] tabular-nums">{value}</span>
      <span className="text-[11px] opacity-85">{label}</span>
    </div>
  );
}
