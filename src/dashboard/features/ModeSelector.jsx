import React from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Monitor, Focus, Users, CheckSquare, Search } from '@/shared/ui/Icons';

export function ModeSelector() {
  const { operatingMode, setOperatingMode } = useWorkspace();

  const handleModeChange = (mode) => {
    setOperatingMode(mode);
  };

  const getIcon = (mode) => {
    switch (mode) {
      case 'NORMAL': return <Monitor className="w-4 h-4 mr-2" />;
      case 'FOCUS': return <Focus className="w-4 h-4 mr-2" />;
      case 'MEETING': return <Users className="w-4 h-4 mr-2" />;
      case 'REVIEW': return <CheckSquare className="w-4 h-4 mr-2" />;
      case 'PLANNING': return <Search className="w-4 h-4 mr-2" />;
      default: return <Monitor className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <Select value={operatingMode} onValueChange={handleModeChange}>
      <SelectTrigger className="w-[180px] h-9 bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:ring-[var(--accent)] transition-all shadow-sm text-[var(--text-primary)]">
        <div className="flex items-center text-sm font-medium">
          {getIcon(operatingMode)}
          <SelectValue placeholder="Operating Mode" />
        </div>
      </SelectTrigger>
      <SelectContent className="z-50">
        <SelectItem value="NORMAL">
          <div className="flex items-center">
            <Monitor className="w-4 h-4 mr-2 text-slate-500" />
            Normal
          </div>
        </SelectItem>
        <SelectItem value="FOCUS">
          <div className="flex items-center">
            <Focus className="w-4 h-4 mr-2 text-amber-500" />
            Deep Focus
          </div>
        </SelectItem>
        <SelectItem value="MEETING">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-500" />
            In a Meeting
          </div>
        </SelectItem>
        <SelectItem value="REVIEW">
          <div className="flex items-center">
            <CheckSquare className="w-4 h-4 mr-2 text-green-500" />
            Reviewing
          </div>
        </SelectItem>
        <SelectItem value="PLANNING">
          <div className="flex items-center">
            <Search className="w-4 h-4 mr-2 text-purple-500" />
            Planning
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
