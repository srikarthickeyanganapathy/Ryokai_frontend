import React from 'react'
import { Icons } from '@/shared/ui/Icons'

export function CommandMenu() {
  const handleOpen = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <div 
      onClick={handleOpen}
      className="flex items-center gap-2 px-3 h-8 text-[13px] text-[var(--text-tertiary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--color-border-subtle)] rounded-[var(--radius-pill)] cursor-pointer transition-colors w-full"
    >
      <Icons.search className="w-3.5 h-3.5" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-[var(--radius-xs)] bg-[var(--bg-elevated)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-tertiary)] shadow-sm">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </div>
  )
}
