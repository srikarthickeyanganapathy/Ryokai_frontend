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
              const name =
                user.fullName || user.username || 'Unknown Member';
              return (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--accent-border)]">
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
              <div className="text-center font-mono text-xs">
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
              <div className="text-center font-mono text-xs text-[var(--accent)]">
                {getValue() ?? 0}
              </div>
            ),
          },
          {
            accessorKey: 'submittedCount',
            header: () => <div className="text-center">Submitted</div>,
            cell: ({ getValue }) => (
              <div className="text-center font-mono text-xs">
                {getValue() ?? 0}
              </div>
            ),
          },
          {
            accessorKey: 'approvedCount',
            header: () => <div className="text-center">Approved</div>,
            cell: ({ getValue }) => (
              <div className="text-center font-mono text-xs text-[var(--success)]">
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
              return (
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className={cn(
                      'font-bold text-sm font-mono',
                      isOver
                        ? 'text-[var(--danger)]'
                        : 'text-[var(--text-primary)]',
                    )}
                  >
                    {count}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    / {threshold}
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
