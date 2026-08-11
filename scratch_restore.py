import re

with open('c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/task/pages/TaskDetailPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Top Stats Row
stats_pattern = re.compile(r'\{/\* ── Top Stats Row ── \*/\}.*?\{/\* ── Main content ── \*/\}', re.DOTALL)
content = re.sub(stats_pattern, '{/* ── Split layout ── */}', content)

# 2. Change main wrapper to grid
content = content.replace('      <div className="flex flex-col">', '''      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-11 items-start">
        <div className="min-w-0">''')

# 3. Add right sidebar and close grid
sidebar = '''
        </div>

        {/* ── Right: sticky sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-5 sticky top-[80px]">
          {/* Attributes card */}
          <div className="bg-white border border-[var(--border-light)] rounded-[18px] p-6">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-1.5 h-1.5 rounded-[2px] bg-[var(--accent)] shrink-0" />
              <span className="font-mono text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.08em]">Attributes</span>
            </div>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-[12px] text-[var(--text-muted)] font-medium">Status</span>
                <StatusBadge status={currentStatus} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-[12px] text-[var(--text-muted)] font-medium">Priority</span>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--text-primary)]">{normalizePriority(task.priority)}</span>
              </div>
              {!isPersonal && (
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                  <span className="text-[12px] text-[var(--text-muted)] font-medium">Assignee</span>
                  {hasAssignPerm ? (
                    <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors cursor-pointer py-0.5">
                          <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold">
                            {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                          </div>
                          {task.assignedTo || 'Unassigned'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-52 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] rounded-lg">
                        <span className="block px-2 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Reassign to</span>
                        <div className="space-y-0.5 max-h-44 overflow-y-auto custom-scrollbar">
                          {assignableUsers.map(u => (
                            <button key={u.id}
                              onClick={() => reassignTask.mutate({ taskId: task.id, newAssigneeId: u.id }, { onSuccess: () => setIsReassignOpen(false) })}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-[12px] rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left">
                              <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate text-[var(--text-primary)] font-medium">{u.username}</span>
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-primary)] py-0.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px]">{(task?.assignedTo || 'U').charAt(0).toUpperCase()}</div>
                      {task.assignedTo || 'Unassigned'}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-[12px] text-[var(--text-muted)] font-medium">Due</span>
                {hasEditPerm ? (
                  <input type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateTask.mutate({ id: task.id, payload: { dueDate: e.target.value || null } }, { onSuccess: () => toast.success('Due date updated') })}
                    className="bg-transparent border border-[var(--border-light)] hover:border-[var(--accent-border)] rounded-md px-2 py-0.5 text-[12px] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer w-[130px] transition-colors text-right" />
                ) : (
                  <span className="text-[12px] font-semibold text-[var(--text-primary)] text-right">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-[12px] text-[var(--text-muted)] font-medium">Created</span>
                <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)] text-right">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[12px] text-[var(--text-muted)] font-medium">Task ID</span>
                <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)] text-right">#{task.id}</span>
              </div>
            </div>
          </div>

          {/* Quick actions card */}
          <div className="bg-white border border-[var(--border-light)] rounded-[18px] p-6">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-1.5 h-1.5 rounded-[2px] bg-[var(--accent)] shrink-0" />
              <span className="font-mono text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.08em]">Quick Actions</span>
            </div>
            <div className="flex flex-col gap-2">
              {renderStateActions("sm")}
            </div>
          </div>
        </aside>

      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-[var(--border-light)] bg-white/50 backdrop-blur-sm sticky bottom-0 z-10">
        <div className="px-6 lg:px-12 py-4 flex items-center justify-between gap-3 max-w-[1280px] mx-auto w-full">
          <span className="text-[12px] text-[var(--text-muted)]">
            Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} by {creatorUsername || 'System'}
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <> · Last edited {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
            )}
          </span>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              {renderStateActions("sm")}
            </div>
            <Button size="sm" disabled={!isDirty || updateTask.isPending} isLoading={updateTask.isPending}
              onClick={() => { updateTask.mutate({ id: task.id, payload: localEdits }, { onSuccess: () => setIsDirty(false) }) }}
              className="rounded-[6px] font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-5 h-8">
              Save Changes
            </Button>
          </div>
        </div>
      </div>'''

content = content.replace('''            </div>
      {confirmDialog}
    </PageShell>''', sidebar + '\n      {confirmDialog}\n    </PageShell>')

with open('c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/task/pages/TaskDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
