import React, { useMemo } from 'react';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import {
  Check,
  AlertCircle,
  Info,
  ShieldCheck,
  BarChart3,
  Users,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { getRiskConfig, SCOPE_LABELS, SCOPE_DESCRIPTIONS } from './constants';
import { ResourcePicker } from './ResourcePicker';

export function PermissionInspectorContent({
  role,
  permission,
  isEnabled,
  currentScope,
  currentAssignments = [],
  isAdmin,
  onScopeChange,
  onResourceAssignmentChange,
  onToggle,
  permissionMap,
  localScopedPerms,
  supervisionNames = [],
  onClose,
}) {
  // Direct required dependencies
  const requires = permission?.requires || [];

  // Reverse dependencies
  const requiredBy = useMemo(() => {
    if (!permission || !permissionMap) return [];
    const result = [];
    permissionMap.forEach((p) => {
      if (
        p.requires?.includes(permission.code) &&
        localScopedPerms[p.code]
      ) {
        result.push(p);
      }
    });
    return result;
  }, [permission, permissionMap, localScopedPerms]);

  // Compute breakdown stats for Role Overview
  const roleStats = useMemo(() => {
    if (!localScopedPerms || !permissionMap)
      return { total: 0, read: 0, write: 0, workflow: 0, critical: 0 };

    let read = 0,
      write = 0,
      workflow = 0,
      critical = 0;

    Object.keys(localScopedPerms).forEach((code) => {
      const p = permissionMap.get(code);
      if (!p) return;
      const g = p.group || 'GENERAL';
      if (g === 'READ') read++;
      else if (g === 'WRITE') write++;
      else if (g === 'WORKFLOW') workflow++;
      if (p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH') critical++;
    });

    return {
      total: Object.keys(localScopedPerms).length,
      read,
      write,
      workflow,
      critical,
    };
  }, [localScopedPerms, permissionMap]);

  // ── Default Role Overview (When no permission is selected) ──
  if (!permission) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-card)] text-left select-none">
        <div className="px-5 pt-4 pb-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Role Overview
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded">
            {role?.name}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Quick Metrics */}
          <Section title="Permission Distribution">
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Enabled"
                value={roleStats.total}
                color="var(--text-primary)"
              />
              <StatCard label="Read" value={roleStats.read} color="#30A46C" />
              <StatCard label="Write" value={roleStats.write} color="#F5A623" />
              <StatCard
                label="Workflow"
                value={roleStats.workflow}
                color="#5E6AD2"
              />
            </div>
          </Section>

          {/* Critical Risk */}
          {roleStats.critical > 0 && (
            <Section title="Security & Risk Profile">
              <div className="p-3 bg-[var(--danger-soft)]/50 border border-[var(--danger-border)]/50 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[var(--danger)]" />
                  <span className="font-semibold text-[var(--danger)]">
                    {roleStats.critical} Privileged Permissions
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--danger)]">
                  High Risk
                </span>
              </div>
            </Section>
          )}

          {/* Supervision Rank */}
          <Section title="Role Authority Hierarchy">
            <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">Priority Level:</span>
                <strong className="font-mono text-[var(--text-primary)]">
                  {role?.priority ?? 100}
                </strong>
              </div>
              <div className="border-t border-[var(--border-subtle)]/60 pt-2">
                <span className="text-[11px] text-[var(--text-muted)] block mb-1">
                  Can Manage:
                </span>
                <div className="flex flex-wrap gap-1">
                  {supervisionNames.length > 0 ? (
                    supervisionNames.map((name) => (
                      <span
                        key={name}
                        className="text-[10px] font-medium bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      >
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)] italic">
                      None — lowest rank
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Guidance */}
          <div className="p-3 bg-[var(--accent-soft)]/30 border border-[var(--accent-border)]/30 rounded-md text-[11px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
            <Sliders className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <p>
              Click any permission row on the left to configure scopes, view dependency chains, and inspect risk details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Selected Permission Details ──
  const risk = getRiskConfig(permission.riskLevel);
  const supportedScopes =
    permission.supportedScopes?.length > 0
      ? permission.supportedScopes
      : ['ORGANIZATION'];

  const showScope =
    permission.scopeRequired !== false && supportedScopes.length > 1;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] text-left select-none">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Checkbox
              checked={isEnabled}
              disabled={isAdmin}
              onCheckedChange={() => onToggle(permission)}
            />
            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
              {permission.name}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] block pl-6">
            {permission.code}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-mono"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Description */}
        {permission.description && (
          <Section title="Description">
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              {permission.description}
            </p>
          </Section>
        )}

        {/* Risk Level */}
        <Section title="Risk Classification">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-medium"
            style={{ backgroundColor: risk.bg, color: risk.text }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: risk.dot }}
            />
            {risk.label} Risk
          </div>
        </Section>

        {/* Scope Selector */}
        {showScope && isEnabled && (
          <Section title="Scope Assignment">
            <div className="space-y-1.5">
              {supportedScopes.map((scopeKey) => (
                <div key={scopeKey} className="flex flex-col gap-2">
                  <label
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                      currentScope === scopeKey
                        ? 'bg-[var(--accent-soft)]/20 border-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
                    )}
                  >
                    <input
                      type="radio"
                      name={`scope-${permission.code}`}
                      value={scopeKey}
                      checked={currentScope === scopeKey}
                      onChange={() => onScopeChange(permission.code, scopeKey)}
                      disabled={isAdmin}
                      className="mt-0.5 accent-[var(--accent)] shrink-0"
                    />
                    <div>
                      <span className="text-[12px] font-medium text-[var(--text-primary)]">
                        {SCOPE_LABELS[scopeKey]}
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-normal">
                        {SCOPE_DESCRIPTIONS[scopeKey]}
                      </p>
                    </div>
                  </label>
                  {['PROJECT', 'TEAM', 'CREW'].includes(scopeKey) && currentScope === scopeKey && permission.requiresResourceAssignment && (
                    <div className="ml-6 pl-4 border-l border-[var(--border-subtle)] mt-2">
                      <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md">
                        <p className="text-[12px] font-medium text-[var(--text-primary)] mb-3">
                          Select Specific {SCOPE_LABELS[scopeKey]}
                        </p>
                        <ResourcePicker 
                          resourceType={scopeKey}
                          selectedAssignments={currentAssignments}
                          onChange={(assignments) => onResourceAssignmentChange(permission.code, assignments)}
                          disabled={isAdmin}
                        />
                      </div>
                    </div>
                  )}
                  {['PROJECT', 'TEAM', 'CREW'].includes(scopeKey) && currentScope === scopeKey && !permission.requiresResourceAssignment && (
                    <div className="ml-6 pl-4 border-l border-[var(--border-subtle)] mt-2">
                      <div className="p-3 bg-[var(--warning-soft)]/30 border border-[var(--warning-border)]/30 rounded-md">
                        <p className="text-[11px] font-medium text-[var(--warning)] mb-1">
                          No resource assignment needed
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                          This permission uses {SCOPE_LABELS[scopeKey]} scope but does not require specific resource assignments.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Dependency Graph: Prerequisites */}
        {requires.length > 0 && (
          <Section title="Dependency Graph — Prerequisites">
            <div className="space-y-1.5">
              {requires.map((reqCode) => {
                const reqPerm = permissionMap.get(reqCode);
                const isSatisfied = Boolean(localScopedPerms[reqCode]);
                return (
                  <div
                    key={reqCode}
                    className={cn(
                      'p-2 rounded-md border text-[11px] flex items-center justify-between gap-2',
                      isSatisfied
                        ? 'bg-[var(--bg-subtle)]/60 border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        : 'bg-[#FEF6E7] border-[#F5A623]/30 text-[#B5850B]'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isSatisfied ? (
                        <Check className="w-3.5 h-3.5 text-[#30A46C] shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {reqPerm?.name || reqCode}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono shrink-0 opacity-80">
                      {isSatisfied ? 'Satisfied' : 'Auto-enables'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Reverse Dependencies: Dependents */}
        {requiredBy.length > 0 && (
          <Section title="Dependency Graph — Dependent Permissions">
            <div className="p-2.5 bg-[var(--danger-soft)]/40 border border-[var(--danger-border)]/40 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[var(--danger)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Disabling this will break access for:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {requiredBy.map((p) => (
                      <span
                        key={p.code}
                        className="text-[10px] font-medium text-[var(--danger)] bg-[var(--danger-soft)] px-1.5 py-0.5 rounded"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Workflow Notes */}
        {permission.workflowNote && (
          <Section title="Workflow Notes">
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-subtle)] p-2.5 rounded-md">
              {permission.workflowNote}
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h6 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
        {title}
      </h6>
      {children}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="p-2.5 rounded-md bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]">
      <span className="text-[10px] font-medium text-[var(--text-muted)] block">
        {label}
      </span>
      <strong className="text-sm font-bold font-mono" style={{ color }}>
        {value}
      </strong>
    </div>
  );
}
