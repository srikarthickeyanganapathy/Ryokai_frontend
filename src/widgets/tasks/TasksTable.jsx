import React from 'react'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { IconButton } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'


const priorityColors = {
  URGENT: 'bg-red-500/10 text-red-600 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  NORMAL: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  LOW: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]',
  NONE: 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]',
}

const statusIcons = {
  'To Do': <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border-default)]" />,
  'In Review': <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin-slow" />,
  'Done': <Icons.check className="w-4 h-4 text-[var(--accent-cyan)]" />,
  'Needs Work': <Icons.alert className="w-4 h-4 text-orange-500" />,
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
  
  const columns = React.useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center px-1">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[var(--color-border-default)] bg-[var(--bg-base)] text-[var(--accent-cyan)] focus:ring-[var(--accent-cyan)] cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center px-1" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[var(--color-border-default)] bg-[var(--bg-base)] text-[var(--accent-cyan)] focus:ring-[var(--accent-cyan)] cursor-pointer"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
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
          <Badge variant="outline" className={cn("text-xs", priorityColors[p])}>
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
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <IconButton 
              variant="ghost" 
              size="sm" 
              title="Mark Complete"
              onClick={() => onQuickComplete(task)}
              disabled={task.status === 'Done'}
            >
              <Icons.check className="w-4 h-4" />
            </IconButton>
            <IconButton 
              variant="ghost" 
              size="sm" 
              title="Delete"
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={() => onQuickDelete(task)}
            >
              <Icons.trash2 className="w-4 h-4" />
            </IconButton>
          </div>
        )
      }
    }
  ], [onQuickComplete, onQuickDelete])

  return (
    <DataTable 
      columns={columns}
      data={tasks || []}
      isLoading={isLoading}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
      onRowClick={onTaskClick}
    />
  )
}
