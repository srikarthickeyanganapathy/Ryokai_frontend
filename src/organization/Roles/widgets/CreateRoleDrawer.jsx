import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/ui/Drawer';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { cn } from '@/shared/lib/cn';
import { ShieldPlus, Copy } from 'lucide-react';

export function CreateRoleDrawer({ roles = [], open, onOpenChange, onCreate, isLoading }) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(100);
  const [creationMode, setCreationMode] = useState('BLANK');
  const [templateRoleId, setTemplateRoleId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim().toUpperCase(), priority: Number(priority) || 0, templateRoleId: creationMode === 'COPY' ? templateRoleId : null });
    setName(''); setPriority(100); setCreationMode('BLANK'); setTemplateRoleId('');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:max-w-sm p-5 flex flex-col bg-[var(--bg-elevated)]/90 backdrop-blur-md border-l border-[var(--border-subtle)] shadow-xl">
        <DrawerHeader className="mb-4 text-left p-0">
          <DrawerTitle className="text-[14px] font-semibold tracking-tight">Create Role</DrawerTitle>
          <DrawerDescription className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">Define a new organizational role or clone an existing template.</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Template</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCreationMode('BLANK')} className={cn('px-3 py-2 text-[12px] font-medium rounded-md border text-center transition-all duration-150 flex flex-col items-center gap-1.5', creationMode === 'BLANK' ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]')}>
                <ShieldPlus className="w-3.5 h-3.5" /> Blank Role
              </button>
              <button type="button" onClick={() => setCreationMode('COPY')} className={cn('px-3 py-2 text-[12px] font-medium rounded-md border text-center transition-all duration-150 flex flex-col items-center gap-1.5', creationMode === 'COPY' ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]')}>
                <Copy className="w-3.5 h-3.5" /> Copy Existing
              </button>
            </div>
          </div>

          {creationMode === 'COPY' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Source Role</label>
              <Select value={templateRoleId} onValueChange={setTemplateRoleId}>
                <SelectTrigger className="w-full h-8 text-[12px]"><SelectValue placeholder="Select role to copy..." /></SelectTrigger>
                <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Role Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MARKETING_LEAD" autoFocus className="h-8 text-[12px] uppercase font-mono tracking-tight" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Priority</label>
            <Input type="number" min="0" value={priority} onChange={(e) => setPriority(e.target.value)} className="h-8 text-[12px] max-w-[100px] font-mono" />
            <p className="text-[10px] text-[var(--text-muted)]">Lower number = higher authority rank.</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" className="flex-1 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" className="flex-1 text-[12px]" disabled={!name.trim() || (creationMode === 'COPY' && !templateRoleId) || isLoading} isLoading={isLoading}>Create</Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}