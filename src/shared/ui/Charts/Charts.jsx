import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'

// Custom Tooltip Wrapper
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] p-3 rounded-[var(--radius-md)] shadow-[var(--shadow-lg),var(--inset-highlight)] backdrop-blur-md">
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--text-secondary)]">{entry.name}:</span>
            <span className="font-semibold text-[var(--text-primary)]">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function CompletionChart({ data }) {
  // Mock data if none provided
  const mockData = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 7 },
    { name: 'Wed', completed: 5 },
    { name: 'Thu', completed: 10 },
    { name: 'Fri', completed: 8 },
    { name: 'Sat', completed: 2 },
    { name: 'Sun', completed: 6 },
  ]
  const finalData = data || mockData

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Completion Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={finalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="completed" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function PriorityChart({ data }) {
  // Semantic colors drawn from the same tokens used across the app, so a
  // chart never introduces a hue that doesn't exist anywhere else in the UI.
  const COLORS = {
    Urgent: 'var(--danger)',
    High: 'var(--warning)',
    Normal: 'var(--accent)',
    Low: 'var(--text-tertiary)'
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || 'var(--text-tertiary)'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ProductivityChart({ data }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Weekly Productivity</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Done" stackId="a" fill="var(--accent)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="InProgress" stackId="a" fill="var(--warning)" opacity={0.85} />
            <Bar dataKey="Todo" stackId="a" fill="var(--bg-subtle)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function WorkloadMatrix({ data }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Upcoming Workload</CardTitle>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
            <Bar dataKey="workload" fill="var(--warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}