import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { RecentlyActive } from './RecentlyActive';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { FolderOpen, ArrowRight, Hash, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CrewContextRail({ context }) {
  const { activeCrew } = useWorkspace();
  const navigate = useNavigate();

  if (!context?.crewContext) return null;
  const { crewContext } = context;
  const { activeTasks = [], projects = [], channels = [] } = crewContext;

  return (
    <div className="flex flex-col gap-5">
      {/* Crew Members */}
      <RecentlyActive />

      {/* Crew Tasks — scoped to this crew */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-[var(--accent)]" />
              Crew Tasks
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!activeCrew ? (
            <div className="text-center py-4">
              <p className="text-xs text-[var(--text-tertiary)]">Select a crew to see tasks</p>
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="text-center py-4">
              <ListTodo className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-tertiary)]">No crew tasks yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    task.priority === 'URGENT' ? 'bg-red-500' :
                    task.priority === 'HIGH' ? 'bg-amber-500' :
                    task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-xs text-[var(--text-primary)] truncate flex-1 font-medium">{task.title}</span>
                  {task.assignee && (
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">{task.assignee}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crew Projects — already scoped via crewId */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
              Crew Projects
            </CardTitle>
            {activeCrew && (
              <button 
                onClick={() => navigate(`/app/crews/${activeCrew.id}`)}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!activeCrew ? (
            <div className="text-center py-4">
              <p className="text-xs text-[var(--text-tertiary)]">Select a crew to see projects</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-4">
              <FolderOpen className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-tertiary)]">No projects shared with this crew</p>
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

      {/* Crew Channels — already scoped via crewId */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Hash className="h-4 w-4 text-[var(--accent)]" />
              Channels
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!activeCrew ? (
            <div className="text-center py-4">
              <p className="text-xs text-[var(--text-tertiary)]">Select a crew to see channels</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-4">
              <Hash className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-tertiary)]">No channels yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {channels.slice(0, 5).map(channel => (
                <div 
                  key={channel.id}
                  onClick={() => navigate(`/app/crews/${activeCrew.id}`)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                >
                  <Hash className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-xs font-medium text-[var(--text-primary)] truncate">{channel.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
