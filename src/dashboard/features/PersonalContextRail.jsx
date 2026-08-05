import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { CalendarWidget } from './CalendarWidget';
import { InboxWidget } from './InboxWidget';
import { FolderOpen, ListTodo, ArrowRight } from '@/shared/ui/Icons';
import { useNavigate } from 'react-router-dom';

export function PersonalContextRail({ context }) {
  const navigate = useNavigate();
  
  if (!context?.personalContext) return null;
  const { personalContext } = context;
  const { activeTasks = [], projects = [] } = personalContext;

  return (
    <div className="flex flex-col gap-5">
      <CalendarWidget />
      <InboxWidget />
      
      {/* Active Tasks — PERSONAL scope only */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-[var(--accent)]" />
              Active Tasks
            </CardTitle>
            <button 
              onClick={() => navigate('/app/tasks')}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {activeTasks.length === 0 ? (
            <div className="text-center py-4">
              <ListTodo className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-tertiary)]">No personal tasks in progress</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors group/item"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    task.priority === 'URGENT' ? 'bg-red-500' :
                    task.priority === 'HIGH' ? 'bg-amber-500' :
                    task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-xs text-[var(--text-primary)] truncate flex-1 font-medium">{task.title}</span>
                  {task.dueDate && (
                    <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums shrink-0">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects — PERSONAL scope only */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
              Projects
            </CardTitle>
            <button 
              onClick={() => navigate('/app/projects')}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {projects.length === 0 ? (
            <div className="text-center py-4">
              <FolderOpen className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-tertiary)]">No personal projects yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {projects.slice(0, 4).map(project => (
                <div 
                  key={project.id}
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[11px] font-bold shrink-0">
                    {project.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{project.name}</p>
                    {project.status && (
                      <p className="text-[10px] text-[var(--text-tertiary)] capitalize">{project.status.toLowerCase().replace('_', ' ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
