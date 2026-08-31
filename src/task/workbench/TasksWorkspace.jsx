import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { Button, IconButton } from "@/shared/ui/Button";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/Popover";
import { Icons } from "@/shared/ui/Icons";
import { KanbanBoard } from "../components/KanbanBoard/KanbanBoard";
import { TasksTable } from "../components/TableView/TasksTable";

/* --- Scope tabs --- */
const SCOPES = [
  { id: "all",       label: "All" },
  { id: "assigned",  label: "Mine" },
  { id: "today",     label: "Today" },
  { id: "upcoming",  label: "Upcoming" },
  { id: "completed", label: "Done" },
  { id: "archived",  label: "Archived" },
];

const VIEWS = [
  { id: "list",   label: "List",    iconKey: "listTodo" },
  { id: "kanban", label: "Kanban",  iconKey: "layout" },
];

const SORTS = [
  { label: "Due soonest", value: "dueDate" },
  { label: "Priority",    value: "priority" },
  { label: "Recent",      value: "updated" },
  { label: "Title A-Z",   value: "title" },
];

export function TasksWorkspace({
  tasks = [], isLoading, isError, error, onRetry, viewMode, activeView: activeViewProp, onTaskClick,
  onTaskStatusChange, onQuickComplete, onQuickDelete,
  rowSelection, setRowSelection, searchActive, filtersActive, onClearFilters, onCreateTask,
  taskScope, onScopeChange,
  globalFilter, setGlobalFilter,
  priorityFilter = [], onPriorityFilterChange,
  sortBy, onSortChange,
  projectFilter = "ALL", onProjectFilterChange,
  teamFilter = "ALL", onTeamFilterChange,
  projectsList = [], teamsList = [],
  showSidebarToggle, onSidebarToggle, onViewChange,
}) {
  const activeView = activeViewProp || viewMode || "list";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const activeFilterCount = (priorityFilter?.length > 0 ? 1 : 0) + (projectFilter !== "ALL" ? 1 : 0) + (teamFilter !== "ALL" ? 1 : 0);

  /* --- States --- */
  if (isError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger)]/20 flex items-center justify-center">
          <Icons.alert className="w-7 h-7 text-[var(--danger)]" />
        </div>
        <div>
          <div className="text-[15px] font-bold text-[var(--text-primary)]">Unable to load tasks</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1.5 max-w-xs">{error?.message || "An unexpected error occurred."}</div>
        </div>
        {onRetry && <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 rounded-xl"><Icons.refresh className="w-3.5 h-3.5" />Try Again</Button>}
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton activeView={activeView} />;

  /* --- Empty states --- */
  let emptyState = null;
  if (tasks.length === 0) {
    if (!searchActive && !filtersActive) {
      emptyState = (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Icons.checkSquare className="w-7 h-7 text-[var(--text-muted)] opacity-40" />
          </motion.div>
          <div><div className="text-[15px] font-bold text-[var(--text-primary)]">No tasks yet</div><div className="text-[12px] text-[var(--text-muted)] mt-1">Create your first task to get started</div></div>
          {onCreateTask && <Button size="sm" onClick={onCreateTask} className="gap-1.5 rounded-xl"><Icons.plus className="w-3.5 h-3.5" />Create Task</Button>}
        </div>
      );
    } else {
      emptyState = (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center"><Icons.search className="w-6 h-6 text-[var(--text-muted)] opacity-40" /></div>
          <div><div className="text-[15px] font-bold text-[var(--text-primary)]">No matching tasks</div><div className="text-[12px] text-[var(--text-muted)] mt-1">Try adjusting your search or filters</div></div>
          {onClearFilters && <Button size="sm" variant="outline" onClick={onClearFilters} className="gap-1.5 rounded-xl"><Icons.x className="w-3.5 h-3.5" />Clear Filters</Button>}
        </div>
      );
    }
  }

  /* --- Unified Toolbar: scope tabs + search + filters + sort + view toggle + create + count --- */
  const Toolbar = (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/60 flex-wrap">
      {/* Sidebar toggle (drawer mode) */}
      {showSidebarToggle && (
        <IconButton variant="ghost" size="sm" onClick={onSidebarToggle} aria-label="Open task navigation">
          <Icons.menu className="w-4 h-4" />
        </IconButton>
      )}

      {/* Scope tabs -- horizontal pills */}
      <div className="flex items-center gap-0.5 min-w-0 flex-wrap">
        {SCOPES.map(s => (
          <button
            key={s.id}
            onClick={() => onScopeChange?.(s.id)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors",
              taskScope === s.id
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1 min-w-[8px]" />

      {/* Search */}
      <div className="relative w-full sm:w-48">
        <Icons.search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={e => setGlobalFilter?.(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-7 py-1.5 text-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent-border)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        {globalFilter && (
          <IconButton variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setGlobalFilter?.("")} aria-label="Clear search">
            <Icons.x className="w-3 h-3" />
          </IconButton>
        )}
      </div>

      {/* Filters popover */}
      <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-7 rounded-lg gap-1 text-[11px] font-medium", activeFilterCount > 0 && "text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-soft)]")}>
            <Icons.filter className="w-3 h-3" /> Filters
            {activeFilterCount > 0 && <span className="min-w-[16px] h-[16px] rounded-full bg-[var(--accent)] text-white text-[9px] flex items-center justify-center font-bold">{activeFilterCount}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg rounded-lg space-y-2.5">
          <div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Priority</span>
            <div className="mt-1 space-y-0.5">
              {["URGENT","HIGH","MEDIUM","LOW"].map(p => (
                <label key={p} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer">
                  <input type="checkbox" checked={priorityFilter.includes(p)} onChange={() => onPriorityFilterChange?.(priorityFilter.includes(p) ? priorityFilter.filter(x => x !== p) : [...priorityFilter, p])} className="rounded" />
                  <span className="text-[12px] font-medium text-[var(--text-primary)] capitalize">{p.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>
          {projectsList?.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] pt-2.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Project</span>
              <select value={projectFilter} onChange={e => onProjectFilterChange?.(e.target.value)} className="mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none">
                <option value="ALL">All Projects</option>
                {projectsList.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
            </div>
          )}
          {teamsList?.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] pt-2.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Team</span>
              <select value={teamFilter} onChange={e => onTeamFilterChange?.(e.target.value)} className="mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none">
                <option value="ALL">All Teams</option>
                {teamsList.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
              </select>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Sort popover */}
      <Popover open={sortOpen} onOpenChange={setSortOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 rounded-lg gap-1 text-[11px] font-medium text-[var(--text-secondary)]">
            <Icons.chevronDown className="w-3 h-3" /> Sort
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-36 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg rounded-lg">
          {SORTS.map(opt => (
            <Button key={opt.value} variant="ghost" size="sm" className="w-full justify-start" onClick={() => { onSortChange?.(opt.value); setSortOpen(false); }}>
              {opt.label}
            </Button>
          ))}
        </PopoverContent>
      </Popover>

      {/* View toggle */}
      <div className="flex items-center bg-[var(--bg-subtle)] rounded-lg p-0.5 gap-0.5">
        {VIEWS.map(v => {
          const IconComp = Icons[v.iconKey];
          return (
            <button
              key={v.id}
              onClick={() => onViewChange?.(v.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                activeView === v.id
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {IconComp && <IconComp className="w-3 h-3" />}
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Create */}
      {onCreateTask && (
        <Button size="sm" onClick={onCreateTask} className="h-7 rounded-lg gap-1 text-[11px] font-medium">
          <Icons.plus className="w-3 h-3" /> New
        </Button>
      )}

      {/* Count */}
      <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">{tasks.length}</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {Toolbar}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeView} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="h-full overflow-auto">
            {tasks.length === 0 ? emptyState : (
              <>
                {activeView === "kanban" && <KanbanBoard tasks={tasks} isLoading={false} emptyState={null} onTaskClick={onTaskClick} onTaskStatusChange={onTaskStatusChange} onQuickComplete={onQuickComplete} onQuickDelete={onQuickDelete} />}
                {activeView === "list" && (
                  <div className="h-full flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-auto">
                      <TasksTable tasks={tasks} isLoading={false} emptyState={null} rowSelection={rowSelection} setRowSelection={setRowSelection} getRowId={(row) => String(row.id)} onTaskClick={onTaskClick} onQuickComplete={onQuickComplete} onQuickDelete={onQuickDelete} />
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingSkeleton({ activeView }) {
  if (activeView === "kanban") {
    return (
      <div className="flex gap-4 p-4 h-full overflow-x-auto custom-scrollbar">
        {[1, 2, 3].map(i => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex flex-col rounded-2xl bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)] w-[85vw] max-w-[320px] sm:w-[320px] shrink-0 p-3 gap-2.5 animate-pulse">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--bg-hover)]" /><div className="h-4 w-20 bg-[var(--bg-hover)] rounded-md" /></div>
            <div className="h-20 bg-[var(--bg-hover)] rounded-xl" />
            <div className="h-24 bg-[var(--bg-hover)] rounded-xl" />
            <div className="h-16 bg-[var(--bg-hover)] rounded-xl" />
          </motion.div>
        ))}
      </div>
    );
  }
  return (
    <div className="p-4 space-y-2 animate-pulse">
      <div className="h-9 bg-[var(--bg-subtle)] rounded-xl" />
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-11 bg-[var(--bg-subtle)] rounded-xl" style={{ opacity: 1 - i * 0.06 }} />)}
    </div>
  );
}
