import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { Pencil, Sparkles } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { TEMPLATES } from './templates';

// State 6: Create Board Modal with Template Selection
export function CreateWhiteboardModal({
  open,
  onOpenChange,
  selectedTemplate,
  onTemplateSelect,
  boardTitle,
  onTitleChange,
  onSubmit,
  isPending
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-xl !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-2xl p-6">
        <div className="flex flex-col space-y-1 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 border border-[var(--accent-border)]">
            <Pencil className="w-5 h-5" />
          </div>
          <Heading level={3} className="text-[16px] font-bold tracking-tight text-[var(--text-primary)]">
            Create New Whiteboard
          </Heading>
          <Text variant="muted" className="text-[12px] text-[var(--text-secondary)]">
            Select a starter template and name your interactive canvas.
          </Text>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Template Selector Grid */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Starter Framework
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((template) => {
                const IconComp = template.icon;
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onTemplateSelect(template.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer",
                      isSelected 
                        ? "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)] font-semibold shadow-xs" 
                        : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" 
                      style={{ backgroundColor: template.bgColor, color: template.accentColor }}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] block truncate font-medium">{template.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Board Title Field */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Board Title
            </Label>
            <Input 
              value={boardTitle} 
              onChange={(e) => onTitleChange(e.target.value)} 
              placeholder="e.g. Sprint 4 Architecture, Q3 Strategy Mindmap..." 
              required 
              className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" 
              autoFocus
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-8 px-4 text-[12px] font-medium rounded-lg" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="h-8 px-4 text-[12px] font-semibold gap-1.5 rounded-lg" 
              isLoading={isPending}
            >
              <Sparkles className="w-3.5 h-3.5" /> Create Board
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
