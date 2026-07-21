import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import TaskNebulaGraph from './TaskNebulaGraph';
import { getKanbanColumnForTask } from '@/shared/lib/status';

// --- Domain/Status Config ---
const DOMAINS = [
  { id: 'To Do', name: 'To Do', color: '#e8734a' },
  { id: 'In Review', name: 'In Review', color: '#d9a441' },
  { id: 'Needs Work', name: 'Needs Work', color: '#8b7ae8' },
  { id: 'Done', name: 'Done', color: '#4fb8a0' }
];

const transformTasksToGraphData = (tasks = []) => {
  const nodes = [];
  const links = [];

  DOMAINS.forEach(d => {
    nodes.push({ id: d.id, name: d.name, color: d.color, isBig: true, val: 14, domain: d.id });
  });

  tasks.forEach(task => {
    const domainId = getKanbanColumnForTask(task);
    const domain = DOMAINS.find(d => d.id === domainId);
    if (!domain) return;

    const val = 2 + Math.random() * 4;
    nodes.push({
      id: task.id,
      name: task.title,
      domain: domainId,
      color: domain.color,
      isBig: false,
      val,
      description: task.description || '',
      rawTask: task
    });

    links.push({ source: task.id, target: domainId, color: domain.color });
  });

  return { nodes, links };
};

export default function NebulaView({ tasks, onTaskSelect }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const containerRef = useRef(null);
  const graphControlsRef = useRef(null);

  useEffect(() => {
    setGraphData(transformTasksToGraphData(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When a node is selected in the 3D graph, pass the raw task to TasksPage
  const handleGraphNodeSelect = (node) => {
    if (onTaskSelect) {
      if (node && !node.isBig && node.rawTask) {
        onTaskSelect(node.rawTask);
      } else {
        onTaskSelect(null);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #0a0e1a 0%, #05060d 55%, #000000 100%)'
      }}
    >
      <div className="absolute inset-0 z-0">
        {graphData.nodes.length > 0 && (
          <TaskNebulaGraph
            ref={graphControlsRef}
            data={graphData}
            width={dimensions.width}
            height={dimensions.height}
            onTaskSelect={handleGraphNodeSelect}
          />
        )}
      </div>

      {/* Top Center Spatial HUD Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/90">3D Nebula Matrix</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70 font-mono">
          <span>{tasks.length} Nodes</span>
          <span>• Click node to inspect</span>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-3">
        <div className="flex flex-col bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
          <button
            onClick={() => graphControlsRef.current?.zoomIn()}
            className="p-3 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <div className="h-px bg-white/10" />
          <button
            onClick={() => graphControlsRef.current?.zoomOut()}
            className="p-3 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <div className="h-px bg-white/10" />
          <button
            onClick={() => graphControlsRef.current?.resetView()}
            className="p-3 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            title="Reset view"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Compact legend */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Status Orbits</div>
          {DOMAINS.map(d => (
            <div key={d.id} className="flex items-center gap-2 py-0.5 text-xs text-white/80">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}` }}
              />
              {d.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}