import React, { forwardRef, createContext, useContext, useId, useMemo } from 'react'
import { Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts'
import { cn } from '@/shared/lib/cn'

/*
 * These were referenced from '@/shared/ui/Charts' (ChartContainer, ChartTooltip,
 * ChartTooltipContent, ChartLegend, ChartLegendContent) by WeeklyProgressChart
 * and the design-system showcase page, but were never defined — both call
 * sites would throw on render. This restores the standard shadcn-style chart
 * primitives, wired to this app's token system instead of Tailwind defaults.
 */

const ChartContext = createContext(null)

function useChartConfig() {
  const ctx = useContext(ChartContext)
  if (!ctx) throw new Error('Chart components must be used within a <ChartContainer />')
  return ctx
}

export const ChartContainer = forwardRef(({ id, className, children, config = {}, ...props }, ref) => {
  const uniqueId = useId()
  const chartId = `chart-${(id || uniqueId).replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-[var(--text-tertiary)] [&_.recharts-cartesian-grid_line]:stroke-[var(--border-subtle)] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[var(--border-strong)] [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

export const ChartTooltip = RechartsTooltip

export const ChartTooltipContent = forwardRef(({
  active,
  payload,
  label,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  formatter,
}, ref) => {
  const { config } = useChartConfig()

  const items = useMemo(() => payload || [], [payload])

  if (!active || !items.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        'grid min-w-[9rem] gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[12px] shadow-[var(--shadow-lg),var(--inset-highlight)]',
        className
      )}
    >
      {!hideLabel && label != null && (
        <div className="font-medium text-[var(--text-primary)]">
          {labelFormatter ? labelFormatter(label, items) : label}
        </div>
      )}
      <div className="grid gap-1">
        {items.map((item, index) => {
          const key = item.dataKey || item.name || `item-${index}`
          const itemConfig = config?.[key]
          const color = item.color || itemConfig?.color
          const displayLabel = itemConfig?.label || item.name

          return (
            <div key={key} className="flex w-full items-center gap-1.5">
              {!hideIndicator && (
                <span
                  className={cn(
                    'shrink-0 rounded-[2px]',
                    indicator === 'dot' && 'h-2 w-2 rounded-full',
                    indicator === 'line' && 'h-[2px] w-3',
                    indicator === 'dashed' && 'h-0 w-3 border-t-2 border-dashed'
                  )}
                  style={{ backgroundColor: indicator !== 'dashed' ? color : undefined, borderColor: color }}
                />
              )}
              <div className="flex flex-1 items-center justify-between gap-3 leading-none">
                <span className="text-[var(--text-secondary)]">{displayLabel}</span>
                <span className="font-mono font-medium tabular-nums text-[var(--text-primary)]">
                  {formatter ? formatter(item.value, item) : item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = 'ChartTooltipContent'

export const ChartLegend = RechartsLegend

export const ChartLegendContent = forwardRef(({ className, payload, hideIcon = false }, ref) => {
  const { config } = useChartConfig()

  if (!payload?.length) return null

  return (
    <div ref={ref} className={cn('flex items-center justify-center gap-4', className)}>
      {payload.map((item) => {
        const key = item.dataKey || item.value
        const itemConfig = config?.[key]
        return (
          <div key={key} className="flex items-center gap-1.5">
            {!hideIcon && (
              <span
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-[var(--text-secondary)] text-xs">
              {itemConfig?.label || item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegendContent'