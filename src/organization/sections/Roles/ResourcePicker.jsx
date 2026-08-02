import React, { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import api from '@/shared/api/api';
import { Search, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';

export function ResourcePicker({ 
  resourceType, 
  selectedAssignments = [], 
  onChange,
  disabled 
}) {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    if (!orgId || !resourceType) return;
    let mounted = true;
    
    const loadResources = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/organizations/${orgId}/lookup/${resourceType}`);
        if (mounted) setResources(data);
      } catch (err) {
        console.error('Failed to load resources', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadResources();
    return () => { mounted = false; };
  }, [orgId, resourceType]);

  const filtered = useMemo(() => {
    if (!search.trim()) return resources;
    const q = search.toLowerCase();
    return resources.filter(r => r.name.toLowerCase().includes(q));
  }, [resources, search]);

  const handleToggle = (resource) => {
    if (disabled) return;
    const exists = selectedAssignments.some(a => a.resourceId === resource.id);
    if (exists) {
      onChange(selectedAssignments.filter(a => a.resourceId !== resource.id));
    } else {
      onChange([...selectedAssignments, { 
        resourceType: resourceType.toUpperCase(), 
        resourceId: resource.id,
        displayName: resource.name 
      }]);
    }
  };

  const handleRemove = (assignmentId) => {
    if (disabled) return;
    onChange(selectedAssignments.filter(a => a.resourceId !== assignmentId));
  }

  // Find names for already selected badges
  const selectedDetails = selectedAssignments.map(sa => {
    const found = resources.find(r => r.id === sa.resourceId);
    return {
      ...sa,
      displayName: found ? found.name : (sa.displayName || `${sa.resourceType} ${sa.resourceId}`)
    };
  });

  return (
    <div className="space-y-4">
      {/* Selected Items */}
      {selectedDetails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDetails.map(item => (
            <Badge key={item.resourceId} variant="secondary" className="flex items-center gap-1 text-xs">
              {item.displayName}
              {!disabled && (
                <button 
                  onClick={() => handleRemove(item.resourceId)}
                  className="hover:text-[var(--danger)] transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          disabled={disabled}
          placeholder={`Search ${resourceType.toLowerCase()}s...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Resource List */}
      <div className="max-h-48 overflow-y-auto border border-[var(--border-subtle)] rounded-md bg-[var(--bg-subtle)]">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-4 text-xs text-[var(--text-muted)]">No resources found.</div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filtered.map(r => {
              const isSelected = selectedAssignments.some(a => a.resourceId === r.id);
              return (
                <div 
                  key={r.id} 
                  onClick={() => handleToggle(r)}
                  className={cn(
                    "flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]",
                    isSelected ? "bg-[var(--accent-subtle)]" : "",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{r.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-[var(--accent)]" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
