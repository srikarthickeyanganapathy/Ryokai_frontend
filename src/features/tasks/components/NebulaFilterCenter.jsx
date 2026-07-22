import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, AlertTriangle, ShieldAlert, User, Clock, CheckCircle2, ChevronDown, ChevronUp, Layers, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const PRESET_QUERIES = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'mine', label: 'Mine', icon: User },
  { id: 'blocked', label: 'Blocked', icon: ShieldAlert },
  { id: 'risk', label: 'High Risk', icon: AlertTriangle },
  { id: 'overdue', label: 'Overdue', icon: Clock },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
]

export default function NebulaFilterCenter({
  searchQuery,
  onSearchChange,
  activePreset,
  onSelectPreset,
  customFilters,
  onCustomFilterChange,
  assignees = []
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFilterCount = (searchQuery ? 1 : 0) +
    (activePreset !== 'all' ? 1 : 0) +
    (customFilters.priority ? 1 : 0) +
    (customFilters.assignee ? 1 : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-5 left-5 z-40 w-72 select-none"
    >
      <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
        
        {/* Compact Command Palette Bar */}
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5 focus-within:border-cyan-500/40 transition-colors">
            <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter constellation..."
              className="w-full bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="text-white/40 hover:text-white p-0.5">
                <X size={11} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1",
              isExpanded || activeFilterCount > 0
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
            )}
            title="Toggle Query Parameters"
          >
            <Filter size={13} />
            {activeFilterCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Query Presets Chips Bar */}
        <div className="px-3 pb-2.5 pt-0.5 flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {PRESET_QUERIES.map(q => {
            const Icon = q.icon
            const isActive = activePreset === q.id
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelectPreset(q.id)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0 border",
                  isActive
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200"
                    : "bg-white/5 border-transparent text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={11} className={isActive ? "text-cyan-400" : "text-white/40"} />
                <span>{q.label}</span>
              </button>
            )
          })}
        </div>

        {/* Collapsible Advanced Attribute Selectors */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-2.5 border-t border-white/10 grid grid-cols-2 gap-2 text-xs bg-white/[0.02]"
            >
              <div>
                <span className="text-[10px] text-white/40 font-mono block mb-1">Priority</span>
                <select
                  value={customFilters.priority || ''}
                  onChange={(e) => onCustomFilterChange('priority', e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white/80 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] text-white/40 font-mono block mb-1">Assignee</span>
                <select
                  value={customFilters.assignee || ''}
                  onChange={(e) => onCustomFilterChange('assignee', e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white/80 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                >
                  <option value="">All Assignees</option>
                  {assignees.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}
