import React, { useState, useCallback, useRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Textarea } from '@/shared/ui/Textarea'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'

/**
 * Drop-in, promise-based replacement for window.confirm / window.prompt.
 *
 * const confirm = useConfirmDialog()
 * const ok = await confirm({ title: 'Delete role?', description: '...', danger: true })
 * const reason = await confirm({ title: 'Reject task', requireInput: true, inputLabel: 'Reason' })
 * // returns `false` on cancel, `true` on plain confirm, or the typed string on requireInput
 */
export function useConfirmDialog() {
  const [state, setState] = useState(null)
  const resolverRef = useRef(null)
  const [value, setValue] = useState('')

  const confirm = useCallback((opts = {}) => {
    setState(opts)
    setValue(opts.defaultValue || '')
    return new Promise((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const close = useCallback((result) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setState(null)
  }, [])

  const dialog = state && (
    <Modal open onOpenChange={(open) => { if (!open) close(false) }}>
      <ModalContent className="max-w-[420px] gap-5">
        <ModalHeader className="gap-2">
          <div className="flex items-center gap-3">
            {state.danger && (
              <div className="w-9 h-9 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center shrink-0">
                <Icons.alert className="w-[18px] h-[18px]" />
              </div>
            )}
            <ModalTitle>{state.title || 'Are you sure?'}</ModalTitle>
          </div>
          {state.description && (
            <ModalDescription className="pl-0">{state.description}</ModalDescription>
          )}
        </ModalHeader>

        {state.requireInput && (
          <Textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={state.inputPlaceholder || 'Add a note…'}
            className="min-h-[84px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                close(value)
              }
            }}
          />
        )}

        <ModalFooter className="gap-2">
          <Button variant="secondary" onClick={() => close(false)}>
            {state.cancelLabel || 'Cancel'}
          </Button>
          <Button
            variant={state.danger ? 'danger' : 'primary'}
            disabled={state.requireInput && state.inputRequired && !value.trim()}
            onClick={() => close(state.requireInput ? value : true)}
          >
            {state.confirmLabel || 'Confirm'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  return { confirm, dialog }
}