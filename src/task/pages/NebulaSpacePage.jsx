import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskList } from '../entities/hooks/useTasks';
import NebulaView from '../components/Nebula/components/NebulaView';
import { Icons } from '@/shared/ui/Icons';

export function NebulaSpacePage() {
  const navigate = useNavigate();
  // Fetch all tasks for the nebula workspace overview
  const { data: rawTasks, isLoading, isError } = useTaskList({ limit: 1000 });
  const tasks = Array.isArray(rawTasks) ? rawTasks : rawTasks?.content || [];

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleExitNebula = () => {
    // Navigate back to tasks or previous page
    navigate('/app/tasks');
  };

  const handleTaskSelect = (task) => {
    if (task) {
      setSelectedTaskId(task.id);
      // Optional: Open a slide-over panel or just let Nebula handle it internally
    } else {
      setSelectedTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center flex-col gap-4 text-white">
        <Icons.loader className="w-8 h-8 animate-spin opacity-50" />
        <div className="text-sm font-mono tracking-widest text-white/50">INITIALIZING NEBULA PROTOCOL...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center flex-col gap-4 text-white">
        <Icons.alert className="w-12 h-12 text-red-500" />
        <div className="text-lg font-semibold">Nebula Core Failure</div>
        <button onClick={handleExitNebula} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
          Return to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <NebulaView 
        tasks={tasks} 
        selectedTask={tasks.find(t => t.id === selectedTaskId) || null} 
        onTaskSelect={handleTaskSelect} 
      />
      {/* Optional Top Bar for exit/branding if NebulaView doesn't provide it */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={handleExitNebula}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all text-xs font-medium uppercase tracking-widest"
        >
          <Icons.chevronLeft className="w-4 h-4" />
          Exit Space
        </button>
      </div>
    </div>
  );
}
