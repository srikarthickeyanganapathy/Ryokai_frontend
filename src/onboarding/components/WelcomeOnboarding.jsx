import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/shared/ui/Modal'
import { RyokaiLogo } from '@/shared/ui/Logo/RyokaiLogo'
import { Button } from '@/shared/ui/Button'

/**
 * Welcome modal — one screen, one decision, under five seconds. The guided
 * tour and setup checklist (progressive disclosure) do the teaching; this
 * just opens the door. CTA starts the tour; "I'll explore" skips quietly.
 */
export function WelcomeOnboarding({ open, onGetStarted, onExplore }) {
  const navigate = useNavigate()

  if (!open) return null

  const getStarted = () => {
    onGetStarted?.()
  }

  const explore = () => {
    onExplore?.()
    navigate('/app')
  }

  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) onExplore?.() }}>
      <ModalContent className="max-w-md gap-4">
        <ModalHeader className="items-start text-left pr-6 gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <RyokaiLogo size="lg" />
          </motion.div>
          <ModalTitle className="text-[22px] tracking-tight text-left">
            Welcome to Ryokai.
          </ModalTitle>
          <ModalDescription className="text-left text-[13.5px]">
            Turn intent into execution — plan work, track progress, and ship together.
          </ModalDescription>
        </ModalHeader>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="primary"
            size="lg"
            onClick={getStarted}
            className="w-full"
            autoFocus
          >
            Let&apos;s get started
          </Button>
          <Button variant="ghost" size="md" onClick={explore} className="w-full">
            I&apos;ll explore on my own
          </Button>
        </div>
      </ModalContent>
    </Modal>
  )
}
