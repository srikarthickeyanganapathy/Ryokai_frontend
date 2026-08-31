import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { OrganizationGoals } from './OrganizationGoals';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { Users, ArrowRight, Building2, FolderOpen } from '@/shared/ui/Icons';
import { useNavigate } from 'react-router-dom';

export function OrgContextRail({ context }) {
  const { activeOrganization } = useWorkspace();
  const navigate = useNavigate();

  if (!context?.organizationContext) return null;
  const { organizationContext } = context;
  const { insights, teams = [], projects = [] } = organizationContext;
  const memberCount = insights?.membersCount ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <OrganizationGoals />

      {/* Org Overview */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />
              Overview
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-subtle)] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">{memberCount}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Members</p>
            </div>
            <div className="bg-[var(--bg-subtle)] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">{teams.length}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Teams</p>
            </div>
            <div className="bg-[var(--bg-subtle)] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">{projects.length}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Projects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams -- already scoped via orgId */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--accent)]" />
              Teams
            </CardTitle>
            {activeOrganization && (
              <button 
                onClick={() => navigate('/app/teams')}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!activeOrganization ? (
            <div className="text-center py-4">
              <p className="text-xs text-[var(--text-tertiary)]">No organization selected</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-4">
              <Users className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
              <p className="text-xs text-[var(--text-tertiary)]">No teams created yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {teams.slice(0, 5).map(team => (
                <div 
                  key={team.id}
                  onClick={() => navigate(`/app/organizations/${activeOrganization.id}/teams/${team.id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center text-[11px] font-bold shrink-0">
                    {team.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{team.name}</p>
                    {team.memberCount !== undefined && (
                      <p className="text-[10px] text-[var(--text-tertiary)]">{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Org Projects -- scoped via orgId */}
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
              Organization Projects
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
              <p className="text-xs text-[var(--text-tertiary)]">No organization projects</p>
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
