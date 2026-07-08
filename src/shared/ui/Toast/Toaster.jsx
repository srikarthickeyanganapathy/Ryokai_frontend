import React from 'react'
import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/app/providers/ThemeProvider'

export const Toaster = ({ ...props }) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[var(--bg-elevated)] group-[.toaster]:text-[var(--text-primary)] group-[.toaster]:border-[var(--color-border-subtle)] group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-[var(--text-secondary)]',
          actionButton:
            'group-[.toast]:bg-[var(--accent-cyan)] group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-[var(--bg-subtle)] group-[.toast]:text-[var(--text-secondary)]',
        },
      }}
      {...props}
    />
  )
}
