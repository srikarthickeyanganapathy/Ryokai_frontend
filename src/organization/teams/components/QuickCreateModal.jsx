import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { toast } from 'sonner'
import { TEAM_TEMPLATES } from './teamTemplates'
import { TeamAvatar } from './TeamAvatar'
import { MemberAvatarPill } from './MemberAvatarPill'

/* ══════════════════════════════════════════════════════
 * QUICK CREATE MODAL WITH TEMPLATES (extracted from TeamsPage)
 * ══════════════════════════════════════════════════════ */

const TEMPLATE_STEP = 'template'
const DETAILS_STEP = 'details'

export function QuickCreateModal({ isOpen, onClose, onCreateWithTemplate }) {
  const [step, setStep] = useState(TEMPLATE_STEP)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = useCallback(() => {
    setStep(TEMPLATE_STEP)
    setSelectedTemplate(null)
    setName('')
    setDescription('')
    onClose()
  }, [onClose])

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template)
    setStep(DETAILS_STEP)
  }, [])

  const handleCreate = useCallback(() => {
    if (!name.trim()) {
      toast.warning('Please enter a team name')
      return
    }
    onCreateWithTemplate?.({
      name: name.trim(),
      description: description.trim() || selectedTemplate?.description || '',
      template: selectedTemplate,
    })
    handleClose()
  }, [name, description, selectedTemplate, onCreateWithTemplate, handleClose])

  // Live preview data
  const previewTeam = useMemo(() => ({
    id: 'preview',
    name: name || 'New Team',
    description: description || selectedTemplate?.description || '',
    members: [{ id: 'you', username: 'You' }],
  }), [name, description, selectedTemplate])

  const previewStats = { taskCount: 0, projectCount: 0, doneCount: 0, completionRate: 0, activeTaskCount: 0 }
  const previewHue = selectedTemplate?.hue ?? 220

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ModalContent className="max-w-[620px] max-h-[85vh] overflow-y-auto p-0 gap-0">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--bg-card)] z-10 px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                {step === DETAILS_STEP && (
                  <button
                    onClick={() => { setStep(TEMPLATE_STEP); setSelectedTemplate(null) }}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors"
                  >
                    <Icons.chevronLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <Heading level={3} className="text-[15px] font-semibold">
                    {step === TEMPLATE_STEP ? 'Choose a Template' : 'Team Details'}
                  </Heading>
                  <Text size="xs" className="text-[var(--text-muted)]">
                    {step === TEMPLATE_STEP
                      ? 'Start with a template or create from scratch'
                      : 'Name your team and customize settings'}
                  </Text>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.x className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === TEMPLATE_STEP && (
                  <motion.div
                    key="templates"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {TEAM_TEMPLATES.map(template => {
                      const TemplateIcon = template.icon
                      return (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTemplateSelect(template)}
                          className="group text-left p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition-all duration-200 bg-[var(--bg-card)]"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `hsl(${template.hue} 60% 45% / 0.12)` }}
                            >
                              <TemplateIcon className="w-5 h-5" style={{ color: `hsl(${template.hue} 70% 50%)` }} />
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                                {template.title}
                                <span className="text-xs">{template.mood}</span>
                              </div>
                              <Text size="xs" className="text-[var(--text-muted)] mt-1 leading-relaxed">
                                {template.description}
                              </Text>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {template.categories.map(cat => (
                                  <span
                                    key={cat}
                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] font-medium"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}

                {step === DETAILS_STEP && selectedTemplate && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-5"
                  >
                    {/* Live Preview Card */}
                    <div className="rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-subtle)]/50">
                      <Text size="xs" className="text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2">
                        Live Preview
                      </Text>
                      <div
                        className="rounded-xl p-4 border border-[var(--border-subtle)]"
                        style={{
                          background: `linear-gradient(135deg, hsl(${previewHue} 60% 20% / 0.06), hsl(${(previewHue + 40) % 360} 50% 15% / 0.04))`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <TeamAvatar name={previewTeam.name} size="md" hue={previewHue} />
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                              {previewTeam.name}
                            </div>
                            <Text size="xs" className="text-[var(--text-muted)] line-clamp-1">
                              {previewTeam.description || 'Add a description...'}
                            </Text>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-3">
                          {['Tasks', 'Projects', 'Done'].map((label, i) => (
                            <div key={label} className="bg-[var(--bg-subtle)] rounded-lg px-2 py-2 text-center">
                              <div className="text-[15px] font-bold text-[var(--text-primary)]">0</div>
                              <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">{label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center mt-3 gap-2">
                          <MemberAvatarPill member={{ username: 'You' }} index={0} />
                          <Text size="xs" className="text-[var(--text-muted)]">You</Text>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1 block">
                          Team Name <span className="text-[var(--danger)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g., Design Studio"
                          autoFocus
                          className="w-full px-3.5 py-2.5 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent-border)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1 block">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder={selectedTemplate.description}
                          rows={3}
                          className="w-full px-3.5 py-2.5 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent-border)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-subtle)]">
                        <selectedTemplate.icon className="w-4 h-4" style={{ color: `hsl(${selectedTemplate.hue} 70% 50%)` }} />
                        <Text size="xs" className="text-[var(--text-secondary)]">
                          Template: <span className="font-semibold text-[var(--text-primary)]">{selectedTemplate.title}</span>
                          <span className="mx-1 text-[var(--text-muted)]">·</span>
                          {selectedTemplate.categories.length} preset categories
                        </Text>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreate}
                        className="gap-1.5 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, hsl(${selectedTemplate.hue} 65% 48%), hsl(${(selectedTemplate.hue + 25) % 360} 60% 40%))`,
                          border: 'none',
                        }}
                      >
                        <Icons.rocket className="w-3.5 h-3.5" />
                        Create Team
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
      </ModalContent>
    </Modal>
  )
}
