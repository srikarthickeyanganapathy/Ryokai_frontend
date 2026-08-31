import React from 'react';
import { Plus, Trash2 } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Label, Text } from '@/shared/ui/Typography';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/ui/Select';

const EMPTY_KR = { title: '', currentValue: 0, targetValue: 100, unit: '%' };

export function GoalModal({ open, editing, setEditing, onSave, isPending }) {
  if (!editing) {
    return (
      <Modal open={open} onOpenChange={(o) => !o && setEditing(null)}>
        <ModalContent className="sm:max-w-2xl" />
      </Modal>
    );
  }

  const isEditingExisting = !!editing.id;

  const addKR = () => {
    setEditing({
      ...editing,
      keyResults: [...(editing.keyResults || []), { ...EMPTY_KR }],
    });
  };

  const removeKR = (index) => {
    setEditing({
      ...editing,
      keyResults: editing.keyResults.filter((_, i) => i !== index),
    });
  };

  const updateKR = (index, field, value) => {
    setEditing({
      ...editing,
      keyResults: editing.keyResults.map((kr, i) =>
        i === index ? { ...kr, [field]: value } : kr,
      ),
    });
  };

  const isFormValid =
    editing.title.trim().length > 0 &&
    Array.isArray(editing.keyResults) &&
    editing.keyResults.some((kr) => kr.title.trim().length > 0);

  return (
    <Modal open={open} onOpenChange={(o) => !o && setEditing(null)}>
      <ModalContent className="sm:max-w-2xl">
        <ModalHeader>
          <ModalTitle>
            {isEditingExisting ? 'Edit strategic goal' : 'New strategic goal'}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-6 mt-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* --- Goal Information --- */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent-soft)]">
                Goal Information
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Title <span className="text-[var(--danger)]">*</span>
              </Label>
              <Input
                placeholder="e.g. Expand Enterprise Customer Base"
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Input
                placeholder="Brief overview of the strategic objective"
                value={editing.description || ''}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Period</Label>
                <Input
                  placeholder="Q3 2026"
                  value={editing.period || ''}
                  onChange={(e) => setEditing({ ...editing, period: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={editing.status || 'ON_TRACK'}
                  onValueChange={(val) => setEditing({ ...editing, status: val })}
                >
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_TRACK">On Track</SelectItem>
                    <SelectItem value="AT_RISK">At Risk</SelectItem>
                    <SelectItem value="OFF_TRACK">Off Track</SelectItem>
                    <SelectItem value="ACHIEVED">Achieved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Start date</Label>
                <Input
                  type="date"
                  value={editing.startDate || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">End date</Label>
                <Input
                  type="date"
                  value={editing.endDate || ''}
                  onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* --- Key Results --- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent-soft)]">
                Key Results
              </span>
              <Button
                variant="ghost"
                onClick={addKR}
                className="gap-1 h-7 text-[11px] px-2.5"
              >
                <Plus className="w-3 h-3" /> Add KR
              </Button>
            </div>

            {(editing.keyResults || []).map((kr, index) => (
              <div
                key={index}
                className="bg-[var(--bg-subtle)] rounded-lg p-3 border border-[var(--color-border-subtle)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    KR {index + 1}
                  </span>
                  {editing.keyResults && editing.keyResults.length > 1 && (
                    <button
                      onClick={() => removeKR(index)}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Input
                  placeholder="e.g. Acquire 30 enterprise customers"
                  value={kr.title || ''}
                  onChange={(e) => updateKR(index, 'title', e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px] text-[var(--text-muted)] mb-1 block">
                      Current
                    </Label>
                    <Input
                      type="number"
                      value={kr.currentValue ?? 0}
                      onChange={(e) =>
                        updateKR(index, 'currentValue', Number(e.target.value))
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[var(--text-muted)] mb-1 block">
                      Target
                    </Label>
                    <Input
                      type="number"
                      value={kr.targetValue ?? 100}
                      onChange={(e) =>
                        updateKR(index, 'targetValue', Number(e.target.value))
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-[var(--text-muted)] mb-1 block">
                      Unit
                    </Label>
                    <Input
                      placeholder="%"
                      value={kr.unit || ''}
                      onChange={(e) => updateKR(index, 'unit', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 pt-4 border-t border-[var(--color-border-subtle)] mt-4">
          <Text size="xs" variant="muted">
            {isFormValid
              ? 'Ready to save'
              : 'Title and at least one KR title are required'}
          </Text>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isPending || !isFormValid}>
              {isPending
                ? 'Saving...'
                : isEditingExisting
                  ? 'Save changes'
                  : 'Create goal'}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
