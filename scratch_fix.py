import re
import sys

try:
    with open('c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/task/pages/TaskDetailPage.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix the syntax error by removing the two extra </div> tags at the end of the grid.
    content = content.replace('''            </aside>

          </div>
        </div>
      </div>''', '''            </aside>
      </div>''')

    # 2. Remove the <aside> entirely.
    aside_pattern = re.compile(r'<aside className="hidden lg:flex flex-col gap-5 sticky top-0">.*?</aside>', re.DOTALL)
    content = re.sub(aside_pattern, '', content)

    # 3. Remove the sticky footer entirely.
    footer_pattern = re.compile(r'\{/\* ── Footer ── \*/\}.*?</div>\s*</div>\s*</div>', re.DOTALL)
    content = re.sub(footer_pattern, '', content)

    # 4. Remove the split layout grid wrapper since there's no sidebar anymore.
    content = content.replace('''      {/* ── Split layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

        {/* ── Left: content column ── */}
        <div className="min-w-0">''', '''      {/* ── Main content ── */}
      <div className="flex flex-col">''')

    # Clean up the closing tags for the main content.
    content = content.replace('''            </aside>
      </div>''', '''      </div>''')
    content = content.replace('''      {confirmDialog}
    </PageShell>''', '''      </div>
      {confirmDialog}
    </PageShell>''')

    # 5. Top header right side:
    header_right_pattern = re.compile(r'(<div className="flex items-center gap-2 sm:self-start ml-10 sm:ml-0">)(.*?(?=\s*</div>\s*</div>\s*\{/\* ── Main content ── \*/\}))', re.DOTALL)
    header_right_replacement = r'''\1
          <div className="hidden lg:flex items-center gap-2 mr-2">
            {renderStateActions("sm")}
          </div>\2'''
    content = re.sub(header_right_pattern, header_right_replacement, content)

    # 6. Add the Stats Row right before ── Main content ──
    stats_row = '''
      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <Icons.users className="w-4 h-4" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em]">Assignee</span>
          </div>
          {!isPersonal && hasAssignPerm ? (
            <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors cursor-pointer outline-none w-full text-left">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                  </div>
                  {task.assignedTo || 'Unassigned'}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] rounded-lg">
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
            <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
              <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
              </div>
              {task.assignedTo || 'Unassigned'}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <Icons.calendar className="w-4 h-4" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em]">Due Date</span>
          </div>
          {hasEditPerm ? (
            <input type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => updateTask.mutate({ id: task.id, payload: { dueDate: e.target.value || null } }, { onSuccess: () => toast.success('Due date updated') })}
              className="bg-transparent border-none text-[14px] font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-0 cursor-pointer w-full p-0" />
          ) : (
            <span className="text-[14px] font-semibold text-[var(--text-primary)]">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <Icons.clock className="w-4 h-4" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em]">Created</span>
          </div>
          <div className="text-[14px] font-semibold text-[var(--text-primary)]">
            {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>
'''
    content = content.replace('{/* ── Main content ── */}', stats_row + '\n      {/* ── Main content ── */}')

    with open('c:/Users/SEC/OneDrive/Desktop/Project/Ryokai/Ryokai_frontend/src/task/pages/TaskDetailPage.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Successfully rewrote TaskDetailPage.jsx layout")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
