import React from 'react'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { IconButton } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { cn } from '@/shared/lib/cn'
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority'

const statusIcons = {
  'To Do': <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border-default)]" />,
  'In Review': <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin-slow" />,
  'Done': <Icons.check className="w-4 h-4 text-[var(--accent)]" />,
  'Needs Work': <Icons.alert className="w-4 h-4 text-[var(--warning)]" />,
}

export function TasksTable({ 
  tasks, 
  isLoading, 
  rowSelection, 
  setRowSelection, 
  onTaskClick,
  onQuickComplete,
  onQuickDelete 
}) {
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const handleDelete = async (task) => {
    const ok = await confirm({
      title: `Delete "${task.title}"?`,
      description: 'This removes the task permanently. This can\'t be undone.',
      confirmLabel: 'Delete task',
      danger: true,
    })
    if (ok) onQuickDelete(task)
  }
  
  const columns = React.useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center px-1">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ? true : (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
            indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center px-1" onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Task',
      cell: ({ row }) => {
        const task = row.original
        const isDone = task.status === 'Done'
        return (
          <div className="flex items-center gap-3">
            <div className="text-[var(--text-secondary)] shrink-0">
              {statusIcons[task.status] || <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border-default)]" />}
            </div>
            <span className={cn("font-medium truncate max-w-[300px] sm:max-w-[400px]", isDone && "line-through text-[var(--text-secondary)]")}>
              {task.title}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => {
        const projectName = row.original.projectName
        const projectId = row.original.projectId
        if (!projectId) return <span className="text-[var(--text-muted)]">-</span>
        return (
          <Badge variant="outline" className="text-xs bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-transparent">
            {projectName || `Project #${projectId}`}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const p = row.original.priority
        return (
          <Badge variant="outline" className={cn("text-xs", PRIORITY_COLORS[p] || PRIORITY_COLORS.MEDIUM)}>
            {normalizePriority(p)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'dueDate',
      header: 'Due',
      cell: ({ row }) => {
        const d = row.original.dueDate
        if (!d) return <span className="text-[var(--text-muted)]">-</span>
        // Just formatting nicely for the demo
        const dateStr = new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        return <span className="text-[var(--text-secondary)] text-sm">{dateStr}</span>
      }
    }
  ], [])

  return (
    <>
      {confirmDialog}
      <DataTable 
        columns={columns}
        data={tasks || []}
        isLoading={isLoading}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        onRowClick={onTaskClick}
      />
    </>
  )
}