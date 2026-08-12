import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { useCreateTeam } from '@/organization'
import { cn } from '@/shared/lib/cn'
import { SPRINGS } from '@/shared/lib/uxTokens'

const NAME_MAX = 50
const DESC_MAX = 140

const CATEGORIES = [
  { id: 'engineering', label: 'Engineering', emoji: '⚙️' },
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'marketing', label: 'Marketing', emoji: '📣' },
  { id: 'product', label: 'Product', emoji: '🚀' },
  { id: 'operations', label: 'Operations', emoji: '🏗️' },
  { id: 'other', label: 'Other', emoji: '📦' },
]

const TEMPLATES = [
  {
    id: 'engineering-sprint',
    emoji: '⚡',
    title: 'Engineering Sprint',
    description: 'Scrum board, code reviews, and deployment tracking for dev teams.',
    defaults: { category: 'engineering' },
  },
  {
    id: 'marketing-campaign',
    emoji: '🎯',
    title: 'Marketing Campaign',
    description: 'Campaign calendar, asset pipeline, and performance dashboards.',
    defaults: { category: 'marketing' },
  },
  {
    id: 'design-studio',
    emoji: '✨',
    title: 'Design Studio',
    description: 'Design reviews, prototype feedback, and asset handoff workflows.',
    defaults: { category: 'design' },
  },
  {
    id: 'blank-canvas',
    emoji: '🖌️',
    title: 'Blank Canvas',
    description: 'Start from scratch. Customize everything your way.',
    defaults: { category: 'other' },
  },
]

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

/* ── Live Preview Card ── */
function LivePreview({ name, description, category, hue }) {
  const displayName = name?.trim() || 'New Team'
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm">
      {/* Gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, hsl(${hue} 75% 55%), hsl(${(hue + 40) % 360} 70% 50%))` }}
        aria-hidden="true"
      />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-base shadow-md ring-1 ring-black/10 shrink-0 transition-all duration-300"
            style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 70% 40%))` }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[13px] text-[var(--text-primary)] tracking-tight truncate">
              {displayName}
            </div>
            {description?.trim() && (
              <Text size="xs" className="text-[var(--text-muted)] truncate leading-snug">
                {description.trim()}
              </Text>
            )}
            {!description?.trim() && (
              <Text size="xs" className="text-[var(--text-muted)] italic">Team description appears here</Text>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] text-[9px] font-mono uppercase">Team</Badge>
          {category && (
            <Badge variant="outline" className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] text-[9px]">
              {CATEGORIES.find(c => c.id === category)?.emoji} {CATEGORIES.find(c => c.id === category)?.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CreateTeamModal - Template + Details
   ═══════════════════════════════════════════════ */
export function CreateTeamModal({ isOpen, onClose, orgId }) {
  const createTeam = useCreateTeam(orgId)
  const [step, setStep] = useState('template') // 'template' | 'details'
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const form = useForm({
    defaultValues: { name: '', description: '' },
  })
  const nameValue = form.watch('name')
  const descValue = form.watch('description')
  const hue = hashHue(nameValue || 'team')

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id)
    setSelectedCategory(template.defaults.category)
    // Auto-advance after a brief delay for the selection animation
    setTimeout(() => setStep('details'), 300)
  }

  const handleCategoryToggle = (catId) => {
    setSelectedCategory(prev => prev === catId ? null : catId)
  }

  const onSubmit = (data) => {
    const payload = {
      ...data,
      template: selectedTemplate,
      category: selectedCategory,
    }
    createTeam.mutate(payload, { onSuccess: () => { form.reset(); setStep('template'); setSelectedTemplate(null); setSelectedCategory(null); onClose() } })
  }

  const handleClose = () => {
    form.reset()
    setStep('template')
    setSelectedTemplate(null)
    setSelectedCategory(null)
    onClose()
  }

  return (
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent className="sm:max-w-lg p-0 overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl">
        <AnimatePresence mode="wait">
          {/* ═══ STEP 1: TEMPLATE SELECTION ═══ */}
          {step === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={SPRINGS.normal}
            >
              {/* Header */}
              <div className="relative px-6 pt-5 pb-4 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
                <ModalHeader className="p-0">
                  <ModalTitle className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                    <Icons.layout className="w-4 h-4 text-[var(--accent)]" />
                    Choose a Template
                  </ModalTitle>
                  <ModalDescription className="text-[12px] text-[var(--text-muted)] mt-1">
                    Pick a starting point for your team workspace. You can customize everything later.
                  </ModalDescription>
                </ModalHeader>
              </div>

              {/* Template Grid */}
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(template => {
                    const isSelected = selectedTemplate === template.id
                    return (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTemplateSelect(template)}
                        className={cn(
                          'relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200',
                          isSelected
                            ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/30'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-hover)]/50',
                        )}
                      >
                        {/* Checkmark */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center"
                          >
                            <Icons.check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                        <span className="text-2xl">{template.emoji}</span>
                        <div>
                          <div className="font-semibold text-[13px] text-[var(--text-primary)]">
                            {template.title}
                          </div>
                          <Text size="xs" className="text-[var(--text-muted)] mt-0.5 leading-snug line-clamp-2">
                            {template.description}
                          </Text>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <ModalFooter className="px-6 pb-5 pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 text-[12px] h-9 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('details')}
                  className="flex-1 text-[12px] h-9 rounded-lg"
                >
                  Skip &rarr; Details
                </Button>
              </ModalFooter>
            </motion.div>
          )}

          {/* ═══ STEP 2: TEAM DETAILS ═══ */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={SPRINGS.normal}
            >
              {/* Header */}
              <div className="relative px-6 pt-5 pb-4 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ background: `radial-gradient(circle at 20% 0%, hsl(${hue} 80% 55%), transparent 60%)` }} aria-hidden="true" />
                <ModalHeader className="relative p-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => setStep('template')}
                      className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Icons.chevronLeft className="w-4 h-4" />
                    </button>
                    <ModalTitle className="text-[15px] font-semibold tracking-tight">
                      Team Details
                    </ModalTitle>
                    {selectedTemplate && (
                      <Badge variant="outline" className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] text-[9px]">
                        {TEMPLATES.find(t => t.id === selectedTemplate)?.emoji} {TEMPLATES.find(t => t.id === selectedTemplate)?.title}
                      </Badge>
                    )}
                  </div>
                  <ModalDescription className="text-[12px] text-[var(--text-muted)]">
                    Give your team a name, description, and category.
                  </ModalDescription>
                </ModalHeader>
              </div>

              {/* Live Preview */}
              <div className="px-6 pt-5">
                <LivePreview
                  name={nameValue}
                  description={descValue}
                  category={selectedCategory}
                  hue={hue}
                />
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{
                      required: 'Team name is required',
                      maxLength: { value: NAME_MAX, message: `Max ${NAME_MAX} characters` },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                            Team Name
                          </FormLabel>
                          <span className={cn(
                            'text-[10px] tabular-nums transition-colors',
                            (field.value || '').length > NAME_MAX * 0.9 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]',
                          )}>
                            {(field.value || '').length}/{NAME_MAX}
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="e.g. Frontend Platform, Growth Team"
                            maxLength={NAME_MAX}
                            autoFocus
                            {...field}
                            className="h-9 text-[13px] rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    rules={{
                      maxLength: { value: DESC_MAX, message: `Max ${DESC_MAX} characters` },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                            Description
                          </FormLabel>
                          <span className={cn(
                            'text-[10px] tabular-nums transition-colors',
                            (field.value || '').length > DESC_MAX * 0.9 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]',
                          )}>
                            {(field.value || '').length}/{DESC_MAX}
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="What does this team work on?"
                            maxLength={DESC_MAX}
                            {...field}
                            className="h-9 text-[13px] rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category Tags */}
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat.id
                        return (
                          <motion.button
                            key={cat.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryToggle(cat.id)}
                            className={cn(
                              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-150',
                              isSelected
                                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-border)]',
                            )}
                          >
                            <span className="text-xs">{cat.emoji}</span>
                            {cat.label}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-start gap-2 rounded-lg bg-[var(--accent-soft)]/60 border border-[var(--accent-border)]/60 px-3 py-2.5">
                    <Icons.users className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
                    <Text size="xs" className="text-[var(--text-secondary)] leading-relaxed">
                      You can add members, assign observers, and connect projects right after creating the team.
                    </Text>
                  </div>

                  {/* Footer */}
                  <ModalFooter className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 text-[12px] h-9 rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTeam.isPending}
                      className="flex-1 text-[12px] h-9 rounded-lg shadow-sm"
                    >
                      {createTeam.isPending ? (
                        <span className="flex items-center gap-1.5">
                          <Icons.loader className="w-3 h-3 animate-spin" /> Creating…
                        </span>
                      ) : (
                        'Create Team'
                      )}
                    </Button>
                  </ModalFooter>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalContent>
    </Modal>
  )
}
