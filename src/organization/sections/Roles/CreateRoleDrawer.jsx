import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/ui/Drawer';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { cn } from '@/shared/lib/cn';

export function CreateRoleDrawer({ roles = [], open, onOpenChange, onCreate, isLoading }) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(100);
  const [creationMode, setCreationMode] = useState('BLANK');
  const [templateRoleId, setTemplateRoleId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim().toUpperCase(),
      priority: Number(priority) || 0,
      templateRoleId: creationMode === 'COPY' ? templateRoleId : null,
    });
    setName('');
    setPriority(100);
    setCreationMode('BLANK');
    setTemplateRoleId('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:max-w-xs p-5 flex flex-col">
        <DrawerHeader className="mb-4 text-left p-0">
          <DrawerTitle className="text-[15px]">Create Role</DrawerTitle>
          <DrawerDescription className="text-[12px]">
            Define a new organizational role or clone an existing permission template.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)]">Template</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCreationMode('BLANK')}
                className={cn(
                  'px-3 py-2 text-[12px] font-medium rounded-md border text-center transition-colors',
                  creationMode === 'BLANK'
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                )}
              >
                Blank Role
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('COPY')}
                className={cn(
                  'px-3 py-2 text-[12px] font-medium rounded-md border text-center transition-colors',
                  creationMode === 'COPY'
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                )}
              >
                Copy Existing
              </button>
            </div>
          </div>

          {creationMode === 'COPY' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">Source Role</label>
              <Select value={templateRoleId} onValueChange={setTemplateRoleId}>
                <SelectTrigger className="w-full h-8 text-[12px]">
                  <SelectValue placeholder="Select role to copy..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)]">Role Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MARKETING_LEAD"
              autoFocus
              className="h-8 text-[12px] uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)]">Priority</label>
            <Input
              type="number"
              min="0"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-8 text-[12px] max-w-[100px]"
            />
            <p className="text-[10px] text-[var(--text-muted)]">Lower number = higher authority rank.</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" className="flex-1 text-[12px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1 text-[12px]"
              disabled={!name.trim() || (creationMode === 'COPY' && !templateRoleId) || isLoading}
              isLoading={isLoading}
            >
              Create
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}