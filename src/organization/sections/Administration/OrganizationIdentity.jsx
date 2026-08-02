import React, { useState, useEffect } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { usePermissions } from '@/identity';
import { useUpdateOrganization } from '../../features/hooks/useOrganizations';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

export function OrganizationIdentity({ org }) {
  const { isOrgAdmin, can } = usePermissions();
  const canEdit = isOrgAdmin || can('ORG_PROFILE_UPDATE');
  const updateOrgMutation = useUpdateOrganization(org?.id);

  const [name, setName] = useState(org?.name || '');
  const [description, setDescription] = useState(org?.description || '');
  
  // Track specifically which field is being updated for targeted loading states
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    // Only update local state if not currently mutating to prevent cursor jumps
    if (org && !updateOrgMutation.isPending) {
      setName(org.name || '');
      setDescription(org.description || '');
    }
  }, [org, updateOrgMutation.isPending]);

  const handleNameBlur = () => {
    if (name.trim() && name !== org?.name) {
      setActiveField('name');
      updateOrgMutation.mutate({ name, description: org?.description }, {
        onSettled: () => setActiveField(null)
      });
    } else {
      setName(org?.name || ''); // reset on empty
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== org?.description) {
      setActiveField('description');
      updateOrgMutation.mutate({ name: org?.name, description }, {
        onSettled: () => setActiveField(null)
      });
    }
  };

  const renderStatus = (field) => {
    if (activeField !== field) return null;
    if (updateOrgMutation.isPending) {
      return <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] animate-pulse"><Icons.spinner className="w-3 h-3 animate-spin" /> Saving...</div>;
    }
    if (updateOrgMutation.isError) {
      return <div className="flex items-center gap-1.5 text-xs text-[var(--danger)]"><Icons.alertCircle className="w-3 h-3" /> Failed to save</div>;
    }
    if (updateOrgMutation.isSuccess) {
      return <div className="flex items-center gap-1.5 text-xs text-[var(--success)] animate-in fade-in zoom-in duration-300"><Icons.checkCircle className="w-3 h-3" /> Saved</div>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={4} className="text-[var(--text-primary)] text-base font-semibold mb-1">Organization Identity</Heading>
        <Text size="sm" variant="muted" className="leading-relaxed">
          The public profile and branding for your organization.
        </Text>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Text size="xs" variant="muted" className="uppercase font-semibold tracking-wider">Name</Text>
            {renderStatus('name')}
          </div>
          {canEdit ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Organization Name"
              className={cn(
                "text-lg font-medium py-3 border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] bg-transparent hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-elevated)] transition-all",
                updateOrgMutation.isError && activeField === 'name' && "border-[var(--danger)] focus:border-[var(--danger)]"
              )}
            />
          ) : (
            <div className="text-lg font-medium py-2 px-3">{org?.name}</div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Text size="xs" variant="muted" className="uppercase font-semibold tracking-wider">Description</Text>
            {renderStatus('description')}
          </div>
          {canEdit ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="What does your organization do?"
              className={cn(
                "resize-none min-h-[100px] border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] bg-transparent hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-elevated)] transition-all",
                updateOrgMutation.isError && activeField === 'description' && "border-[var(--danger)] focus:border-[var(--danger)]"
              )}
            />
          ) : (
            <div className="py-2 px-3 text-[var(--text-secondary)] whitespace-pre-wrap">{org?.description || 'No description provided.'}</div>
          )}
        </div>
      </div>
    </div>
  );
}
