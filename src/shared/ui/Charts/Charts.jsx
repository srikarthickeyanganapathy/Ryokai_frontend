import React, { forwardRef } from 'react'
import { Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts'
import { cn } from '@/shared/lib/cn'

// Context to pass config down to tooltips and legends
const ChartContext = React.createContext(null)

export const ChartContainer = forwardRef(({ id, config, children, className, ...props }, ref) => {
  const chartId = React.useId()
  const themeId = id || chartId

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={themeId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-[var(--text-secondary)] [&_.recharts-cartesian-grid_line]:stroke-[var(--color-border-subtle)] [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[var(--color-border-subtle)] [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-[var(--color-border-subtle)] [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <style>
          {`
            [data-chart=${themeId}] {
              ${Object.entries(config)
                .map(([key, item]) => {
                  return `--color-${key}: ${item.color || 'var(--accent-cyan)'};`
                })
                .join('\n')}
            }
          `}
        </style>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

export const ChartTooltip = RechartsTooltip

export const ChartTooltipContent = forwardRef(({ active, payload, className, indicator = 'dot', hideLabel = false, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!hideLabel && (
        <div className="font-medium text-[var(--text-secondary)] mb-1">
          {payload[0].payload.name || payload[0].name}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = item.dataKey || item.name || 'value'
          const itemConfig = config[key]

          return (
            <div
              key={index}
              className="flex w-full items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                {indicator === 'dot' && (
                  <div
                    className="h-2 w-2 rounded-full border border-solid"
                    style={{
                      backgroundColor: item.color || itemConfig?.color,
                      borderColor: item.color || itemConfig?.color,
                    }}
                  />
                )}
                {indicator === 'line' && (
                  <div
                    className="h-1 w-3 rounded-full"
                    style={{
                      backgroundColor: item.color || itemConfig?.color,
                    }}
                  />
                )}
                <span className="text-[var(--text-secondary)]">
                  {itemConfig?.label || item.name}
                </span>
              </div>
              <span className="font-medium tabular-nums text-[var(--text-primary)]">
                {item.value.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = 'ChartTooltipContent'

export const ChartLegend = RechartsLegend

export const ChartLegendContent = forwardRef(({ payload, verticalAlign = 'bottom', className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === 'top' ? "pb-3" : "pt-3",
        className
      )}
      {...props}
    >
      {payload.map((item, index) => {
        const key = item.dataKey || item.value
        const itemConfig = config[key]

        return (
          <div
            key={index}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-[var(--text-secondary)]"
          >
            <div
              className="h-2 w-2 rounded-[2px]"
              style={{
                backgroundColor: item.color || itemConfig?.color,
              }}
            />
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {itemConfig?.label || item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegendContent'
