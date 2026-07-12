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
            'group toast group-[.toaster]:bg-[var(--bg-elevated)] group-[.toaster]:border group-[.toaster]:border-[var(--border-subtle)] group-[.toaster]:text-[var(--text-primary)] group-[.toaster]:shadow-[var(--shadow-md)] group-[.toaster]:rounded-[var(--radius-md)]',
          description: 'group-[.toast]:text-[var(--text-secondary)]',
          actionButton:
            'group-[.toast]:bg-[var(--accent)] group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-[var(--bg-subtle)] group-[.toast]:text-[var(--text-secondary)]',
        },
      }}
      {...props}
    />
  )
}