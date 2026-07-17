import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { motion } from 'framer-motion'

// Custom Premium Tooltip Wrapper
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--color-border-subtle)] p-4 rounded-[var(--radius-lg)] shadow-2xl"
      >
        <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm" 
                  style={{ backgroundColor: entry.color || entry.payload.color || 'var(--accent)' }} 
                />
                <span className="text-[var(--text-secondary)] font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold text-[var(--text-primary)]">{entry.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }
  return null
}

export function CompletionChart({ data }) {
  // Use provided data or fallback to an empty set if not provided correctly
  const finalData = data && data.length > 0 ? data : [
    { name: 'Mon', completed: 0 }, { name: 'Tue', completed: 0 }, { name: 'Wed', completed: 0 }
  ]

  return (
    <Card className="h-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 backdrop-blur-xl shadow-sm overflow-hidden">
      <CardHeader className="border-b border-[var(--color-border-subtle)]/30 pb-4">
        <CardTitle className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Completion Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pt-6 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={finalData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border-subtle)" strokeOpacity={0.4} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border-subtle)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--accent)" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent)', className: 'drop-shadow-md' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PriorityChart({ data }) {
  const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042']
  
  return (
    <Card className="h-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 backdrop-blur-xl shadow-sm">
      <CardHeader className="border-b border-[var(--color-border-subtle)]/30 pb-4">
        <CardTitle className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] flex flex-col items-center justify-center pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={40} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '20px' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function WorkloadMatrix({ data }) {
  const finalData = data && data.length > 0 ? data : [
    { name: 'Today', workload: 0 }, { name: 'Tomorrow', workload: 0 }
  ]

  return (
    <Card className="h-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 backdrop-blur-xl shadow-sm overflow-hidden">
      <CardHeader className="border-b border-[var(--color-border-subtle)]/30 pb-4">
        <CardTitle className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Upcoming Workload</CardTitle>
      </CardHeader>
      <CardContent className="h-[230px] pt-6 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={finalData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border-subtle)" strokeOpacity={0.4} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} dx={-10} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border-subtle)', opacity: 0.15 }} />
            <Bar dataKey="workload" fill="var(--warning)" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

