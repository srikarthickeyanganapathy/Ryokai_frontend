import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { Monitor, Focus, Users, CheckSquare, Search, ChevronDown } from '@/shared/ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';

const MODES = [
  { key: 'NORMAL', label: 'Normal', icon: Monitor, color: '#64748b', desc: 'Standard workspace' },
  { key: 'FOCUS', label: 'Deep Focus', icon: Focus, color: '#f59e0b', desc: 'Minimize distractions' },
  { key: 'MEETING', label: 'In a Meeting', icon: Users, color: '#3b82f6', desc: 'Mute notifications' },
  { key: 'REVIEW', label: 'Reviewing', icon: CheckSquare, color: '#22c55e', desc: 'Code & design reviews' },
  { key: 'PLANNING', label: 'Planning', icon: Search, color: '#a855f7', desc: 'Roadmap & strategy' },
];

export function ModeSelector() {
  const { operatingMode, setOperatingMode } = useWorkspace();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = MODES.find(m => m.key === operatingMode) || MODES[0];
  const CurrentIcon = current.icon;

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent-border)] transition-all shadow-sm text-[var(--text-primary)]"
      >
        <CurrentIcon className="w-4 h-4" style={{ color: current.color }} />
        <span className="text-sm font-medium">{current.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 w-64 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-1.5">
              {MODES.map((mode) => {
                const ModeIcon = mode.icon;
                const isActive = operatingMode === mode.key;
                return (
                  <motion.button
                    key={mode.key}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setOperatingMode(mode.key);
                      setOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${mode.color}15` }}
                    >
                      <ModeIcon className="w-4 h-4" style={{ color: mode.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{mode.label}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{mode.desc}</p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
