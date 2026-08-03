import React, { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import api from '@/shared/api/api';
import { Search, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';

export function ResourcePicker({ resourceType, selectedAssignments = [], onChange, disabled }) {
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
      } catch (err) { console.error('Failed to load resources', err); } 
      finally { if (mounted) setLoading(false); }
    };
    loadResources();
    return () => { mounted = false; };
  }, [orgId, resourceType]);

  const filtered = useMemo(() => {
    if (!search.trim()) return resources;
    const q = search.toLowerCase();
    return resources.filter((r) => r.name.toLowerCase().includes(q));
  }, [resources, search]);

  const handleToggle = (resource) => {
    if (disabled) return;
    const exists = selectedAssignments.some((a) => a.resourceId === resource.id);
    if (exists) onChange(selectedAssignments.filter((a) => a.resourceId !== resource.id));
    else onChange([...selectedAssignments, { resourceType: resourceType.toUpperCase(), resourceId: resource.id, displayName: resource.name }]);
  };

  const handleRemove = (assignmentId) => {
    if (disabled) return;
    onChange(selectedAssignments.filter((a) => a.resourceId !== assignmentId));
  };

  const selectedDetails = selectedAssignments.map((sa) => {
    const found = resources.find((r) => r.id === sa.resourceId);
    return { ...sa, displayName: found ? found.name : (sa.displayName || `${sa.resourceType} ${sa.resourceId}`) };
  });

  return (
    <div className="space-y-3">
      {selectedDetails.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedDetails.map((item) => (
            <Badge key={item.resourceId} variant="secondary" className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md">
              {item.displayName}
              {!disabled && <button onClick={() => handleRemove(item.resourceId)} className="hover:text-[var(--danger)] transition-colors ml-1"><X className="w-3 h-3" /></button>}
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input type="text" disabled={disabled} placeholder={`Search ${resourceType.toLowerCase()}s...`} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md pl-8 pr-3 py-2 text-[12px] focus:outline-none focus:border-[var(--accent)] transition-colors" />
      </div>
      <div className="max-h-48 overflow-y-auto rounded-md border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-4 text-[11px] text-[var(--text-muted)]">No resources found.</div>
        ) : (
          filtered.map((r) => {
            const isSelected = selectedAssignments.some((a) => a.resourceId === r.id);
            return (
              <div key={r.id} onClick={() => handleToggle(r)} className={cn('flex items-center justify-between px-3 py-2 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]', isSelected && 'bg-[var(--accent-soft)]', disabled && 'opacity-50 cursor-not-allowed')}>
                <span className="text-[12px] font-medium text-[var(--text-primary)]">{r.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}