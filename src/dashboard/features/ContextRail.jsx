import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { FileText, Activity, Users, Sparkles } from 'lucide-react';
import { useDrawerManager } from '@/shared/workspace-framework';

export function ContextRail({ suggestedActions, workspaceMode }) {
  const { open } = useDrawerManager();

  return (
    <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
      
      {/* AI Summary / Briefing */}
      <Card className="bg-accent text-white border-0 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={64} />
        </div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/90">
            <Sparkles size={16} />
            {workspaceMode === 'PERSONAL' ? 'Daily Briefing' : 'Context Briefing'}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm text-white/90 leading-relaxed mb-4">
            You have {suggestedActions?.length || 0} key items aligned for execution today. The team is unblocked, but design reviews are pending for tomorrow.
          </p>
          <Button size="sm" variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-0">
            Summarize Activity
          </Button>
        </CardContent>
      </Card>

      {/* Suggested Actions or Quick Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wider text-tertiary uppercase">Context Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center gap-2 text-secondary hover:text-primary bg-elevated border-subtle hover:border-default hover:bg-hover"
            onClick={() => open('notes')}
          >
            <FileText size={20} />
            <span className="text-xs">Notes</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center gap-2 text-secondary hover:text-primary bg-elevated border-subtle hover:border-default hover:bg-hover"
            onClick={() => open('activity')}
          >
            <Activity size={20} />
            <span className="text-xs">Activity</span>
          </Button>
          {workspaceMode !== 'PERSONAL' && (
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2 text-secondary hover:text-primary bg-elevated border-subtle hover:border-default hover:bg-hover col-span-2"
              onClick={() => open('team')}
            >
              <Users size={20} />
              <span className="text-xs">Team Availability</span>
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
