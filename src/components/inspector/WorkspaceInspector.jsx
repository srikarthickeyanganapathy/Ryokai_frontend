import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInspector } from '@/context/InspectorContext';
import { X, Loader2 } from '@/shared/ui/Icons';
import { useEntityInspector } from './useEntityInspector';

export function WorkspaceInspector() {
  const { isOpen, selectedEntity, activeTab, closeInspector, setTab } = useInspector();

  const { data: inspectorData, isLoading } = useEntityInspector(
    selectedEntity?.type, 
    selectedEntity?.data?.id
  );

  if (!isOpen || !selectedEntity) return null;

  const { type, data: baseData } = selectedEntity;
  const data = inspectorData || baseData;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'properties', label: 'Properties' },
    { id: 'actions', label: 'Actions' },
    { id: 'history', label: 'History' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-80 md:w-96 h-full bg-[var(--bg-base)] border-l border-[var(--color-border-subtle)] shadow-xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
            <h2 className="text-lg font-semibold capitalize">{type} Inspector</h2>
            <button
              onClick={closeInspector}
              className="p-1 rounded-md hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border-subtle)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[var(--text-primary)] border-b-2 border-blue-500'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-8">
                 <Loader2 className="animate-spin text-[var(--text-muted)]" size={24} />
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                        {data?.name?.charAt(0) || type.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{data?.name || 'Unknown Entity'}</h3>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {data?.status || 'Active'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {data?.description || 'No description available for this entity.'}
                    </p>
                    
                    {data?.metrics && data.metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {data.metrics.map((metric, idx) => (
                          <div key={idx} className="bg-[var(--bg-subtle)] p-3 rounded-lg">
                            <div className="text-xs text-[var(--text-secondary)]">{metric.label}</div>
                            <div className="font-semibold">{metric.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'properties' && (
                  <div className="space-y-4 text-sm">
                    {data?.properties ? Object.entries(data.properties).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 border-b border-[var(--color-border-subtle)] pb-2">
                        <span className="text-[var(--text-secondary)] capitalize">{key}</span>
                        <span className="font-medium text-right">{value || 'N/A'}</span>
                      </div>
                    )) : (
                      <div className="text-[var(--text-muted)] text-sm">No properties available.</div>
                    )}
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-3 flex flex-col">
                    {data?.actions ? data.actions.map((action, idx) => (
                       <button key={idx} className={`py-2 px-4 rounded-md transition-colors text-sm font-medium text-left ${action.danger ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-[var(--bg-subtle)] hover:bg-blue-50 text-blue-600'}`}>
                         {action.label}
                       </button>
                    )) : (
                       <div className="text-[var(--text-muted)] text-sm">No actions available.</div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {data?.history && data.history.length > 0 ? (
                      <div className="relative pl-4 border-l-2 border-[var(--color-border-subtle)]">
                        {data.history.map((event, idx) => (
                          <div key={idx} className="mb-4">
                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1"></div>
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{event.timestamp} by {event.author}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="text-[var(--text-muted)] text-sm">No history available.</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
