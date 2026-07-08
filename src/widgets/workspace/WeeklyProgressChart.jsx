import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/Charts'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Heading, Text } from '@/shared/ui/Typography'

const mockData = []

const chartConfig = {
  completed: {
    label: "Completed Tasks",
    color: "var(--accent-cyan)",
  },
  added: {
    label: "Added Tasks",
    color: "var(--text-secondary)",
  },
}

export function WeeklyProgressChart({ data = mockData, isLoading }) {
  if (isLoading) {
    return (
      <Card className="h-full min-h-[350px] animate-pulse flex flex-col">
        <CardHeader className="pb-2">
          <div className="h-5 w-32 bg-[var(--bg-subtle)] rounded" />
          <div className="h-4 w-48 bg-[var(--bg-subtle)] rounded mt-2" />
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
           <div className="h-32 w-full bg-[var(--bg-subtle)] rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden">
      {/* Subtle Breathing Gradient */}
      <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-[var(--accent-cyan)]/5 blur-[100px] rounded-full pointer-events-none transition-opacity duration-1000 opacity-50 group-hover:opacity-100" />
      
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Progress</span>
          <span className="text-sm font-medium text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-2 py-0.5 rounded-full">
            On Track
          </span>
        </CardTitle>
        <Text variant="muted" size="sm">Your task velocity compared to new arrivals.</Text>
      </CardHeader>
      
      <CardContent className="flex-1 relative z-10 pb-0 px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillAdded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-added)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="var(--color-added)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickMargin={12}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickMargin={12}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                type="monotone"
                dataKey="added"
                stroke="var(--color-added)"
                fillOpacity={1}
                fill="url(#fillAdded)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="var(--color-completed)"
                fillOpacity={1}
                fill="url(#fillCompleted)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
