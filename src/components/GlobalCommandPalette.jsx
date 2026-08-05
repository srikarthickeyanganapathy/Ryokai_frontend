import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, FileText, Send, User, Target } from '@/shared/ui/Icons';
import { useInspector } from '@/context/InspectorContext';

export function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { openInspector } = useInspector();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'invite', label: 'Invite Member', icon: UserPlus, action: () => console.log('Invite') },
    { id: 'exit', label: 'Submit Exit Request', icon: Send, action: () => console.log('Exit') },
    { id: 'announce', label: 'Post Announcement', icon: FileText, action: () => console.log('Announce') },
    { id: 'inspector', label: 'Open Inspector (Self)', icon: User, action: () => openInspector('member', { name: 'Current User', role: 'Admin' }) },
  ];

  // Dummy fuzzy search results
  const results = [
    { id: 'm1', type: 'member', label: 'Alice Smith', icon: User },
    { id: 't1', type: 'team', label: 'Frontend Engineering', icon: Target },
    { id: 'g1', type: 'goal', label: 'Q4 Product Launch', icon: Target },
  ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl bg-[var(--bg-base)] rounded-xl shadow-2xl border border-[var(--color-border-subtle)] overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-[var(--color-border-subtle)]">
            <Search className="w-5 h-5 text-[var(--text-secondary)] mr-3" />
            <input
              type="text"
              autoFocus
              placeholder="Search members, teams, goals, or type a command..."
              className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center text-xs text-[var(--text-secondary)] gap-1">
              <kbd className="bg-[var(--bg-subtle)] px-2 py-1 rounded">esc</kbd>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
            {query === '' ? (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Quick Actions
                </div>
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-blue-600 rounded-md transition-colors"
                  >
                    <action.icon className="w-4 h-4 mr-3" />
                    {action.label}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Search Results
                </div>
                {results.length > 0 ? (
                  results.map(res => (
                    <button
                      key={res.id}
                      onClick={() => {
                        openInspector(res.type, { name: res.label, id: res.id });
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-md transition-colors"
                    >
                      <res.icon className="w-4 h-4 mr-3 text-[var(--text-secondary)]" />
                      {res.label}
                      <span className="ml-auto text-xs text-[var(--text-secondary)] capitalize">{res.type}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center text-[var(--text-secondary)] text-sm">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
