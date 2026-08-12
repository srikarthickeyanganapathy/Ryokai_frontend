import { Heading } from '@/shared/ui/Typography';
import { cn } from '@/shared/lib/cn';
import { DataTable } from '@/shared/ui/data-table/DataTable';
import { getTrendDirection } from '@/organization/workload/features/utils/workloadCalculations';
import { Sparkline } from './Sparkline';
import { TrendIcon } from './TrendIcon';

export function WorkloadMatrixTable({ rows, threshold, history, isLoading }) {
  return (
    <div className="space-y-3">
      <Heading
        level={2}
        className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]"
      >
        Workload Matrix Table
      </Heading>
      <DataTable
        columns={[
          {
            id: 'member',
            header: 'Team Member',
            cell: ({ row }) => {
              const user = row.original.user || {};
              const name = user.fullName || user.username || 'Unknown Member';
              const isOver = (row.original.totalActiveCount ?? 0) > threshold;
              return (
                <div className="flex items-center gap-3 py-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                      isOver
                        ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                        : 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]',
                    )}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[13px] truncate">
                      {name}
                    </div>
                    {user.email && (
                      <div className="text-[11px] text-[var(--text-muted)] truncate">
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
              );
            },
          },
          {
            accessorKey: 'todoCount',
            header: () => <div className="text-center">To Do</div>,
            cell: ({ getValue }) => (
              <div className="text-center font-mono text-xs text-[var(--text-secondary)]">
                {getValue() ?? 0}
              </div>
            ),
          },
          {
            accessorKey: 'inProgressCount',
            header: () => (
              <div className="text-center">In Progress</div>
            ),
            cell: ({ getValue }) => (
              <div className="text-center font-mono text-xs font-bold text-[var(--accent)]">
                {getValue() ?? 0}
              </div>
            ),
          },
          {
            accessorKey: 'submittedCount',
            header: () => <div className="text-center">Submitted</div>,
            cell: ({ getValue }) => (
              <div className="text-center font-mono text-xs text-[var(--text-secondary)]">
                {getValue() ?? 0}
              </div>
            ),
          },
          {
            accessorKey: 'approvedCount',
            header: () => <div className="text-center">Approved</div>,
            cell: ({ getValue }) => (
              <div className="text-center font-mono text-xs font-bold text-[var(--success)]">
                {getValue() ?? 0}
              </div>
            ),
          },
          {
            accessorKey: 'totalActiveCount',
            header: () => <div className="text-center">Active Total</div>,
            cell: ({ row }) => {
              const count = row.original.totalActiveCount ?? 0;
              const isOver = count > threshold;
              const pct = Math.min(100, Math.round((count / threshold) * 100));
              return (
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={cn(
                      'font-bold text-sm font-mono',
                      isOver ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]',
                    )}
                  >
                    {count}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    / {threshold}
                  </span>
                  <span className="w-12 h-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                    <span
                      className={cn(
                        'block h-full rounded-full',
                        isOver ? 'bg-[var(--danger)]' : pct > 75 ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </div>
              );
            },
          },
          {
            id: 'sparkline',
            header: () => (
              <div className="min-w-[80px]">14-Day Trend</div>
            ),
            cell: ({ row }) => {
              const userId =
                row.original.user?.id || row.original.user?.username;
              const data = history[userId] || [];
              const trend = getTrendDirection(data);
              return (
                <div className="flex items-center gap-2">
                  <Sparkline
                    data={data}
                    color={
                      row.original.totalActiveCount > threshold
                        ? 'var(--danger)'
                        : 'var(--accent)'
                    }
                  />
                  <TrendIcon trend={trend} />
                </div>
              );
            },
          },
        ]}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyStateTitle="No workload data"
        emptyStateDescription="No active task assignments found in this organization."
      />
    </div>
  );
}
