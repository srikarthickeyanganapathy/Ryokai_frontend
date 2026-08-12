import { cn } from '@/shared/lib/cn';

/**
 * Section divider matching V1 Capacity Command demo.
 * Renders a colored accent bar, title, tag pill, and optional trailing hint.
 */
export function SectionDivider({ title, tag, hint, className }) {
  return (
    <div className={cn('flex items-center gap-2.5 mt-8 mb-3.5', className)}>
      <span className="w-[3px] h-[15px] rounded-[3px] bg-[var(--accent)] shrink-0" />
      <h2 className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>
      {tag && (
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--text-tertiary)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 rounded-full">
          {tag}
        </span>
      )}
      <span className="flex-1" />
      {hint && (
        <span className="font-mono text-[10.5px] text-[var(--text-tertiary)] tracking-[0.04em]">
          {hint}
        </span>
      )}
    </div>
  );
}
