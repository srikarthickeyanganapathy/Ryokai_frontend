import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/shared/lib/cn'
import { Text, Heading } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'

export function DataTable({
  columns,
  data,
  isLoading,
  emptyStateTitle = "🎉 You're all caught up.",
  emptyStateDescription = "Create your first task.",
  emptyStateAction,
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
    <div className="w-full h-full flex flex-col bg-[var(--bg-base)]">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-xs),var(--inset-highlight-soft)] overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="h-9 px-3 align-middle font-semibold text-[11px] uppercase tracking-[0.04em] text-[var(--text-tertiary)] whitespace-nowrap bg-[var(--bg-subtle)]"
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
                  <tr key={index} className="border-b border-[var(--border-subtle)]">
                    {columns.map((_, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2.5 align-middle">
                        <div className="h-3.5 w-full bg-[var(--bg-subtle)] rounded-[var(--radius-xs)] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                // Data Rows
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      "border-b border-[var(--border-subtle)] last:border-b-0 transition-colors hover:bg-[var(--bg-hover-strong)] group",
                      onRowClick && "cursor-pointer",
                      row.getIsSelected() && "bg-[var(--accent-soft)]"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Heading level={4} className="tracking-tight">{emptyStateTitle}</Heading>
                      <Text variant="muted">{emptyStateDescription}</Text>
                      {emptyStateAction && (
                        <div className="pt-2">
                          {emptyStateAction}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        {data.length > 0 && (
           <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
             <Text size="sm" variant="muted" className="text-[12px]">
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