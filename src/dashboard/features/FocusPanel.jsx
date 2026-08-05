import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { CheckCircle2, Clock, ArrowRight, Target, Rocket, Building2 } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useDrawerManager } from '@/shared/workspace-framework';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

const FOCUS_CONFIG = {
  PERSONAL: {
    badge: 'Current Focus',
    badgeClass: 'text-accent border-accent/20 bg-accent/5',
    icon: Target,
    emptyTitle: "You're caught up.",
    emptyDesc: 'No high-priority tasks need your attention right now.',
    emptyIcon: CheckCircle2,
    action: 'Continue Working',
  },
  CREWS: {
    badge: 'Crew Focus',
    badgeClass: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    icon: Rocket,
    emptyTitle: 'Crew is on track.',
    emptyDesc: 'No crew tasks require immediate action.',
    emptyIcon: Rocket,
    action: 'Jump In',
  },
  ORG: {
    badge: 'Strategic Focus',
    badgeClass: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
    icon: Building2,
    emptyTitle: 'No blockers detected.',
    emptyDesc: 'Organization workflow is running smoothly. No escalations pending.',
    emptyIcon: Building2,
    action: 'Review Details',
  },
};

export function FocusPanel({ focusTask, resumeContext }) {
  const { open } = useDrawerManager();
  const { workspaceMode, operatingMode, activeCrew, activeOrganization } = useWorkspace();

  const config = FOCUS_CONFIG[workspaceMode] || FOCUS_CONFIG.PERSONAL;
  const EmptyIcon = config.emptyIcon;

  if (!focusTask) {
    return (
      <Card className="relative overflow-hidden group h-full">
        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="pt-6 pb-8 flex flex-col items-center justify-center text-center space-y-4 h-full">
          <div className="h-16 w-16 rounded-full bg-subtle flex items-center justify-center text-tertiary mb-2">
            <EmptyIcon size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-primary">{config.emptyTitle}</h2>
          <p className="text-secondary max-w-sm">
            {config.emptyDesc}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      variant="interactive"
      className="relative overflow-hidden group h-full"
      onClick={() => open('task', { taskId: focusTask.id })}
    >
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={config.badgeClass}>
                {config.badge}
              </Badge>
              {resumeContext && (
                <span className="text-xs text-secondary font-medium flex items-center gap-1">
                  <Clock size={12} /> Resuming
                </span>
              )}
              {workspaceMode === 'CREWS' && activeCrew && (
                <span className="text-xs text-[var(--text-tertiary)] font-medium">
                  in {activeCrew.name}
                </span>
              )}
              {workspaceMode === 'ORG' && activeOrganization && (
                <span className="text-xs text-[var(--text-tertiary)] font-medium">
                  in {activeOrganization.name}
                </span>
              )}
            </div>
            
            <h2 className="text-2xl font-semibold text-primary line-clamp-2">
              {focusTask.title}
            </h2>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                <span>{focusTask.status || 'In Progress'}</span>
              </div>
              {focusTask.project && (
                <div className="flex items-center gap-1.5">
                  <span className="text-tertiary">•</span>
                  <span>{focusTask.project.name}</span>
                </div>
              )}
              {focusTask.assigneeName && workspaceMode !== 'PERSONAL' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-tertiary">•</span>
                  <span>{focusTask.assigneeName}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-white rounded-full px-6 shadow-sm group-hover:shadow-accent/25 transition-all">
              {config.action}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
