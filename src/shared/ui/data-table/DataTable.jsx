import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Text, Heading } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Icons } from '@/shared/ui/Icons'
import { Skeleton } from '@/shared/ui/Skeleton'

export function DataTable({
  columns,
  data,
  isLoading,
  emptyStateTitle = "🎉 You're all caught up.",
  emptyStateDescription = "Create your first task.",
  emptyStateAction,
  emptyStateNode,
  rowSelection,
  setRowSelection,
  onRowClick,
}) {
  const [sorting, setSorting] = React.useState([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      ...(rowSelection !== undefined ? { rowSelection } : {}),
    },
    enableRowSelection: true,
  })

  return (
    <div className="w-full flex flex-col bg-transparent">
      <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] overflow-hidden flex-1 flex flex-col shadow-[var(--shadow-md)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--color-border-subtle)] sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="h-9 px-4 align-middle font-medium text-[var(--text-secondary)] whitespace-nowrap bg-[var(--bg-subtle)] text-[12px]"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                // Loading State
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-[var(--color-border-subtle)]">
                    {columns.map((_, cellIndex) => (
                      <td key={cellIndex} className="p-3 align-middle">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                // Data Rows with staggered entrance
                table.getRowModel().rows.map((row, rowIndex) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(rowIndex * 0.025, 0.3),
                      duration: 0.2,
                      ease: 'easeOut',
                    }}
                    className={cn(
                      "border-b border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--bg-subtle)] group",
                      onRowClick && "cursor-pointer",
                      row.getIsSelected() && "bg-[var(--bg-subtle)]"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-3 align-middle"
                        onClick={(e) => {
                          // Only fire row click on non-interactive cells
                          const isInteractive = cell.column.id === 'title' ||
                            e.target.closest('button') ||
                            e.target.closest('input') ||
                            e.target.closest('a') ||
                            e.target.closest('[role="checkbox"]');
                          if (!isInteractive && onRowClick) {
                            onRowClick(row.original)
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="p-6">
                    {emptyStateNode ? (
                      emptyStateNode
                    ) : (
                      <>
                        <EmptyState
                          icon={Icons.inbox}
                          title={emptyStateTitle}
                          description={emptyStateDescription}
                          actionLabel={emptyStateAction ? "Add New" : undefined}
                          onAction={undefined}
                        />
                        {emptyStateAction && (
                          <div className="flex justify-center mt-[-1rem] pb-4">
                            {emptyStateAction}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.length > 0 && (
           <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border-subtle)] bg-[var(--bg-elevated)]">
             <Text size="sm" variant="muted">
               {table.getFilteredSelectedRowModel().rows.length} of{" "}
               {table.getFilteredRowModel().rows.length} row(s) selected.
             </Text>
             <div className="flex items-center space-x-2">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => table.previousPage()}
                 disabled={!table.getCanPreviousPage()}
               >
                 Previous
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => table.nextPage()}
                 disabled={!table.getCanNextPage()}
               >
                 Next
               </Button>
             </div>
           </div>
        )}
      </div>
    </div>
  )
}
