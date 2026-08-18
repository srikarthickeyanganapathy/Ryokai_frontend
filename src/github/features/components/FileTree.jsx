import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, File, ChevronRight, Home, Loader2, RefreshCw, FileX2, Inbox } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { useGithubContents } from '@/github/features/hooks/useGithub'
import { FileEditorDialog } from '@/github/features/components/FileEditorDialog'

/* ============================================================
   FileTree — read-only repository browser (GitHub Contents API).
   Live data only: every listing is fetched from the backend on
   demand. Directories load on click; breadcrumbs navigate back up.
   ============================================================ */

function formatSize(bytes) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function Breadcrumbs({ fullName, path, onNavigate }) {
  const parts = path ? path.split('/') : []
  const crumbs = [{ label: fullName, path: '' }, ...parts.map((p, i) => ({
    label: p,
    path: parts.slice(0, i + 1).join('/'),
  }))]

  return (
    <nav aria-label="Repository path" className="flex items-center gap-1 flex-wrap px-3.5 pt-3">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path + i}>
          {i > 0 && <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />}
          <button
            type="button"
            onClick={() => onNavigate(crumb.path)}
            className={cn(
              'max-w-[180px] truncate rounded-md px-1.5 py-0.5 text-[12px] transition-colors',
              i === crumbs.length - 1
                ? 'font-semibold text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            )}
          >
            {i === 0 ? (
              <span className="inline-flex items-center gap-1">
                <Home className="w-3 h-3" /> {crumb.label}
              </span>
            ) : (
              crumb.label
            )}
          </button>
        </React.Fragment>
      ))}
    </nav>
  )
}

export function FileTree({ fullName }) {
  const [path, setPath] = useState('')
  const [openFile, setOpenFile] = useState(null)
  const { data, isLoading, isError, error, refetch, isFetching } = useGithubContents(fullName, path)

  const entries = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    const dirs = list.filter((e) => e.type === 'dir').sort((a, b) => a.name.localeCompare(b.name))
    const files = list.filter((e) => e.type !== 'dir').sort((a, b) => a.name.localeCompare(b.name))
    return [...dirs, ...files]
  }, [data])

  const openDir = (entryPath) => setPath(entryPath)

  if (isLoading) {
    return (
      <div className="px-3.5 py-8 flex items-center justify-center gap-2 text-[var(--text-muted)]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading repository files…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-3.5 py-8 flex flex-col items-center gap-2 text-center">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <FileX2 className="w-[18px] h-[18px] text-red-500" />
        </div>
        <p className="text-[12.5px] text-[var(--text-secondary)] max-w-[280px]">
          {error?.response?.data?.message || 'Could not load repository files.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
        </Button>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="px-3.5 py-8 flex flex-col items-center gap-2 text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
          <Inbox className="w-[18px] h-[18px] text-[var(--text-muted)]" />
        </div>
        <p className="text-[12.5px] text-[var(--text-secondary)]">This folder is empty.</p>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs fullName={fullName} path={path} onNavigate={setPath} />
      <motion.ul
        key={path || 'root'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="px-2 py-2 space-y-0.5"
        role="tree"
        aria-label={`Files in ${fullName}${path ? '/' + path : ''}`}
      >
        {entries.map((entry) => (
          <li key={entry.path} role="treeitem" aria-expanded={entry.type === 'dir' ? false : undefined}>
            <button
              type="button"
              onClick={() => entry.type === 'dir' ? openDir(entry.path) : setOpenFile(entry.path)}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors',
                entry.type === 'dir'
                  ? 'hover:bg-[var(--bg-subtle)] cursor-pointer group'
                  : 'hover:bg-[var(--bg-subtle)] cursor-pointer group'
              )}
            >
              {entry.type === 'dir' ? (
                <Folder className="w-4 h-4 text-[var(--accent)] shrink-0 fill-[var(--accent-soft)] group-hover:scale-110 transition-transform" strokeWidth={1.75} />
              ) : (
                <File className="w-4 h-4 text-[var(--text-muted)] shrink-0" strokeWidth={1.75} />
              )}
              <span className={cn(
                'flex-1 truncate text-[12.5px]',
                entry.type === 'dir' ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              )}>
                {entry.name}
              </span>
              {entry.type === 'dir' ? (
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              ) : (
                <span className="text-[10.5px] font-mono text-[var(--text-tertiary)] shrink-0">
                  {formatSize(entry.size)}
                </span>
              )}
            </button>
          </li>
        ))}
      </motion.ul>
      {openFile && (
        <FileEditorDialog
          fullName={fullName}
          path={openFile}
          onClose={() => {
            setOpenFile(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
