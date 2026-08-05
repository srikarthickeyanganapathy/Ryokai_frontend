import React, { useState } from 'react';
import {
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
  Trophy,
  CheckCircle2,
  CircleDot,
  Circle,
  Clock,
  Target,
  Edit2,
  Trash2,
} from '@/shared/ui/Icons';
import { Text } from '@/shared/ui/Typography';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { AnimatedNumber, ProgressBar } from '@/shared/ui/Progress';
import {
  getKRSummary,
  getKRStatus,
  getKRProgress,
  getTimeRemaining,
} from '../utils/goalCalculations';

const GOAL_STATUS_CONFIG = {
  ON_TRACK: {
    icon: TrendingUp,
    label: 'On Track',
    badgeClass:
      'text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent-border)]',
    dotClass: 'bg-[var(--accent)]',
    iconBg: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  },
  AT_RISK: {
    icon: AlertTriangle,
    label: 'At Risk',
    badgeClass:
      'text-[var(--warning)] bg-[var(--warning-soft)] border-[var(--color-border-subtle)]',
    dotClass: 'bg-[var(--warning)]',
    iconBg: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  },
  OFF_TRACK: {
    icon: TrendingDown,
    label: 'Off Track',
    badgeClass:
      'text-[var(--danger)] bg-[var(--danger-soft)] border-[var(--color-border-subtle)]',
    dotClass: 'bg-[var(--danger)]',
    iconBg: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  },
  ACHIEVED: {
    icon: Trophy,
    label: 'Achieved',
    badgeClass:
      'text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent-border)]',
    dotClass: 'bg-[var(--accent)]',
    iconBg: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  },
};

const KR_STATUS_CONFIG = {
  complete: {
    icon: CheckCircle2,
    iconClass: 'text-[var(--accent)]',
  },
  'in-progress': {
    icon: CircleDot,
    iconClass: 'text-[var(--warning)]',
  },
  'not-started': {
    icon: Circle,
    iconClass: 'text-[var(--text-muted)]',
  },
};

const TIME_TONE_CLASS = {
  normal: 'text-[var(--text-muted)]',
  warning: 'text-[var(--warning)]',
  danger: 'text-[var(--danger)]',
  success: 'text-[var(--accent)]',
};

function KeyResultRow({ kr, canManage, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(kr.currentValue);

  const status = getKRStatus(kr);
  const progress = getKRProgress(kr);
  const statusConfig = KR_STATUS_CONFIG[status] || KR_STATUS_CONFIG['not-started'];
  const KRStatusIcon = statusConfig.icon;

  const handleStartEdit = () => {
    setLocalValue(kr.currentValue);
    setEditing(true);
  };

  const handleSave = () => {
    if (localValue !== kr.currentValue) {
      onUpdate(localValue);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setLocalValue(kr.currentValue);
  };

  return (
    <div className="group bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] transition-colors">
      <div className="flex items-start gap-2.5">
        <KRStatusIcon
          className={cn('w-4 h-4 mt-0.5 shrink-0', statusConfig.iconClass)}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Text size="xs" className="font-medium truncate">
              {kr.title}
            </Text>
            <Text size="xs" variant="muted" className="font-mono shrink-0">
              {Number(kr.currentValue) || 0} / {Number(kr.targetValue) || 100}{' '}
              {kr.unit || ''}
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <ProgressBar value={progress} className="flex-1 max-w-[200px]" height="h-1" />
            <AnimatedNumber
              value={progress}
              suffix="%"
              className="text-[10px] font-mono text-[var(--text-muted)] w-9 text-right"
            />
            {canManage && !editing && (
              <Button
                variant="ghost"
                onClick={handleStartEdit}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-[10px] px-2 shrink-0"
              >
                Update
              </Button>
            )}
          </div>
          {editing && (
            <div className="flex items-center gap-2 mt-2 animate-in fade-in duration-150">
              <Input
                type="number"
                value={localValue}
                onChange={(e) => setLocalValue(Number(e.target.value))}
                className="w-24 h-7 text-xs font-mono"
                autoFocus
              />
              <Text size="xs" variant="muted" className="font-mono">
                / {Number(kr.targetValue) || 100} {kr.unit || ''}
              </Text>
              <Button onClick={handleSave} className="h-7 text-[10px] px-3">
                Save
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="h-7 text-[10px] px-2">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GoalCard({ goal, expanded, onToggle, canManage, onUpdateKR, onEdit, onDelete }) {
  const statusConfig = GOAL_STATUS_CONFIG[goal.status] || GOAL_STATUS_CONFIG.ON_TRACK;
  const krSummary = getKRSummary(goal.keyResults);
  const timeRemaining = getTimeRemaining(goal.endDate);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] glass-panel border overflow-hidden transition-all duration-200',
        expanded
          ? 'border-[var(--accent-border)]'
          : 'border-[var(--color-border-subtle)] hover:border-[var(--accent-border)]',
      )}
    >
      {/* Card header — clickable to toggle expansion */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-[var(--bg-subtle)] transition-colors"
      >
        {/* Title row: status icon + title/description + period */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              statusConfig.iconBg,
            )}
          >
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <Text className="font-semibold text-sm truncate block">{goal.title}</Text>
            {goal.description && (
              <Text
                variant="muted"
                className="text-xs leading-relaxed mt-0.5 line-clamp-2"
              >
                {goal.description}
              </Text>
            )}
          </div>
          {goal.period && (
            <span className="text-[10px] text-[var(--text-muted)] font-mono border border-[var(--color-border-subtle)] px-2 py-0.5 rounded-full shrink-0">
              {goal.period}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3 pl-11">
          <ProgressBar value={goal.progress} className="flex-1 max-w-md" />
          <AnimatedNumber
            value={goal.progress}
            suffix="%"
            className="text-sm font-mono font-semibold text-[var(--text-base)] w-12 text-right"
          />
        </div>

        {/* Metadata row: status badge + KR summary + time remaining + chevron */}
        <div className="flex items-center gap-3 pl-11 text-[10px] flex-wrap">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-full border',
              statusConfig.badgeClass,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dotClass)} />
            {statusConfig.label}
          </span>

          {krSummary.total > 0 && (
            <span className="inline-flex items-center gap-1 text-[var(--text-muted)] font-mono">
              <Target className="w-3 h-3" />
              {krSummary.complete}/{krSummary.total} KRs
            </span>
          )}

          {timeRemaining && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono',
                TIME_TONE_CLASS[timeRemaining.tone],
              )}
            >
              <Clock className="w-3 h-3" />
              {timeRemaining.label}
            </span>
          )}

          <ChevronDown
            className={cn(
              'w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ml-auto',
              expanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Expanded: Key Results detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-border-subtle)] pt-3 bg-[var(--bg-subtle)]/40">
          <div className="flex items-center justify-between mb-3">
            <Text
              size="xs"
              variant="muted"
              className="uppercase tracking-wider font-semibold font-mono block"
            >
              Key Results
            </Text>
            {canManage && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="h-7 text-[11px] px-2.5 gap-1 text-[var(--text-muted)] hover:text-[var(--text-base)]"
                  >
                    <Edit2 className="w-3 h-3" /> Edit goal
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete goal "${goal.title}"?`)) {
                        onDelete();
                      }
                    }}
                    className="h-7 text-[11px] px-2 gap-1 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]/50"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                )}
              </div>
            )}
          </div>
          {goal.keyResults?.length > 0 ? (
            <div className="space-y-2">
              {goal.keyResults.map((kr) => (
                <KeyResultRow
                  key={kr.id || kr.title}
                  kr={kr}
                  canManage={canManage}
                  onUpdate={(newValue) => onUpdateKR(goal, kr.id, newValue)}
                />
              ))}
            </div>
          ) : (
            <Text size="xs" variant="muted" className="italic block py-2">
              No key results defined yet.
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
