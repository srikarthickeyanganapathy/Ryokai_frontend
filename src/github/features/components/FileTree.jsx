import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Folder, File, ChevronRight, Home, Loader2, RefreshCw, FileX2, Inbox } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { useGithubContents } from '@/github/features/hooks/useGithub'
import { FileEditorDialog } from '@/github/features/components/FileEditorDialog'

function formatSize(bytes) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function Breadcrumbs({ fullName, path, onNavigate, navRef }) {
  const parts = path ? path.split('/') : []
  const crumbs = [{ label: fullName, path: '' }, ...parts.map((p, i) => ({
    label: p,
    path: parts.slice(0, i + 1).join('/'),
  }))]

  return (
    <nav
      ref={navRef}
      tabIndex={-1}
      aria-label="Repository path"
      className="flex items-center gap-1 flex-wrap px-3.5 pt-3"
    >
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path + i}>
          {i > 0 && <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" aria-hidden="true" />}
          <button
            type="button"
            onClick={() => onNavigate(crumb.path)}
            aria-current={i === crumbs.length - 1 ? 'page' : undefined}
            className={cn(
              'max-w-[180px] truncate rounded-md px-1.5 py-0.5 text-[12px] transition-colors',
              i === crumbs.length - 1
                ? 'font-semibold text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            )}
          >
            {i === 0 ? (
              <span className="inline-flex items-center gap-1">
                <Home className="w-3 h-3" aria-hidden="true" /> {crumb.label}
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
  const navRef = useRef(null)
  const mountedRef = useRef(false)
  const { data, isLoading, isError, error, refetch, isFetching } = useGithubContents(fullName, path)

  const entries = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    const dirs = list.filter((e) => e.type === 'dir').sort((a, b) => a.name.localeCompare(b.name))
    const files = list.filter((e) => e.type !== 'dir').sort((a, b) => a.name.localeCompare(b.name))
    return [...dirs, ...files]
  }, [data])

  // After navigating into a folder, the previously focused row is unmounted --
  // move focus to the breadcrumbs so keyboard users don't lose their place.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    navRef.current?.focus()
  }, [path])

  const openDir = (entryPath) => setPath(entryPath)

  return (
    <div>
      {/* Announce navigation to screen readers */}
      <p className="sr-only" role="status">{path ? `Opened folder ${path}` : ''}</p>

      {/* Always rendered -- fixes getting trapped in empty/error folders */}
      <Breadcrumbs fullName={fullName} path={path} onNavigate={setPath} navRef={navRef} />

      {isLoading ? (
        <div role="status" className="px-3.5 py-8 flex items-center justify-center gap-2 text-[var(--text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading repository files...
        </div>
      ) : isError ? (
        <div className="px-3.5 py-8 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center" aria-hidden="true">
            <FileX2 className="w-[18px] h-[18px] text-red-500" aria-hidden="true" />
          </div>
          <p role="alert" className="text-[12.5px] text-[var(--text-secondary)] max-w-[280px]">
            {error?.response?.data?.message || 'Could not load repository files.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Retry
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="px-3.5 py-8 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center" aria-hidden="true">
            <Inbox className="w-[18px] h-[18px] text-[var(--text-muted)]" aria-hidden="true" />
          </div>
          <p className="text-[12.5px] text-[var(--text-secondary)]">This folder is empty.</p>
          <p className="text-[11.5px] text-[var(--text-tertiary)]">Use the path above to go back up.</p>
        </div>
      ) : (
        <motion.ul
          key={path || 'root'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="px-2 py-2 space-y-0.5"
          aria-label={`Files in ${fullName}${path ? '/' + path : ''}`}
        >
          {entries.map((entry) => (
            <li key={entry.path}>
              <button
                type="button"
                onClick={() => (entry.type === 'dir' ? openDir(entry.path) : setOpenFile(entry.path))}
                aria-label={entry.type === 'dir' ? `${entry.name} (folder)` : entry.name}
                title={entry.name}
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-[var(--bg-subtle)] cursor-pointer group"
              >
                {entry.type === 'dir' ? (
                  <Folder className="w-4 h-4 text-[var(--accent)] shrink-0 fill-[var(--accent-soft)] group-hover:scale-110 transition-transform motion-reduce:transition-none motion-reduce:group-hover:scale-100" strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <File className="w-4 h-4 text-[var(--text-muted)] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                )}
                <span className={cn(
                  'flex-1 truncate text-[12.5px]',
                  entry.type === 'dir' ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                )}>
                  {entry.name}
                </span>
                {entry.type === 'dir' ? (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
                ) : (
                  <span className="text-[10.5px] font-mono text-[var(--text-tertiary)] shrink-0">
                    {formatSize(entry.size)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </motion.ul>
      )}

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