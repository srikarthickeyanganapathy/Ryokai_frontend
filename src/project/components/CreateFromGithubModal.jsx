import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Search, ArrowRight, Loader2, Check, ExternalLink, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { useGithubRepos, useGithubConfig, useGithubConnect, useSyncAllGithub } from '@/github'
import { useCreateProject } from '../features/hooks/useProjects'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

/* ============================================================
   components/CreateFromGithubModal.jsx -- turn a connected GitHub
   repository into a project in one step. No mock data: only
   repos the GitHub mirror actually knows are offered.
   ============================================================ */

export function CreateFromGithubModal({ open, onOpenChange }) {
  const navigate = useNavigate()
  const { data: config } = useGithubConfig()
  const { data: reposData = {}, isLoading: reposLoading } = useGithubRepos()
  const connect = useGithubConnect()
  const syncAll = useSyncAllGithub()
  const createMutation = useCreateProject()

  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // /github/repos returns { connected, repositories } -- normalize the array.
  const repos = useMemo(() => (Array.isArray(reposData?.repositories) ? reposData.repositories : []), [reposData])

  const filtered = useMemo(() => {
    const list = Array.isArray(repos) ? repos : []
    return list.filter(r => (r.fullName || '').toLowerCase().includes(query.trim().toLowerCase()))
  }, [repos, query])

  const pick = (repo) => {
    setSelected(repo)
    setName(repo.fullName.split('/')[1] || repo.fullName)
    setDescription(repo.description || '')
  }

  const reset = () => {
    setSelected(null)
    setQuery('')
    setName('')
    setDescription('')
  }

  const handleClose = (openState) => {
    onOpenChange(openState)
    if (!openState) reset()
  }

  const handleCreate = () => {
    if (!selected || !name.trim()) {
      toast.error('Pick a repository and give the project a name')
      return
    }
    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
        repoFullName: selected.fullName,
        isPersonal: true,
      },
      {
        onSuccess: (project) => {
          toast.success(`Project "${project.name}" created from ${selected.fullName}`)
          reset()
          onOpenChange(false)
          navigate(`/app/projects/${project.id}`)
        },
      }
    )
  }

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="sm:max-w-2xl !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
              <Github className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <div>
              <Heading level={3} className="text-[15px] font-semibold mb-0.5">Create project from GitHub</Heading>
              <Text variant="muted" size="sm">Pick a connected repository -- the project is born linked to it.</Text>
            </div>
          </div>
        </div>

        {!config?.appConfigured ? (
          <div className="p-10 text-center">
            <Text className="text-[13.5px]">GitHub App is not configured yet.</Text>
            <Text variant="muted" size="sm" className="mt-1">Connect it from the GitHub hub, then come back.</Text>
          </div>
        ) : config?.connected !== true || reposData?.connected === false ? (
          <div className="p-10 text-center">
            <Text className="text-[13.5px]">Connect your GitHub account first.</Text>
            <Text variant="muted" size="sm" className="mt-1">Repositories are personal -- authorize with your own GitHub identity to create a project from a repo.</Text>
            <Button
              size="sm"
              className="mt-4 gap-1.5 h-8 text-[12px]"
              onClick={() => connect.mutate()}
              isLoading={connect.isPending}
            >
              <Github className="w-3.5 h-3.5" /> Connect GitHub Account
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Repo picker */}
            <div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search your connected repositories..."
                  className="pl-9 h-9 text-[13px]"
                />
              </div>
              <div className="max-h-56 overflow-y-auto custom-scrollbar rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                {reposLoading && (
                  <div className="flex items-center justify-center py-8 text-[var(--text-muted)] text-[12.5px]">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading connected repositories...
                  </div>
                )}
                {!reposLoading && filtered.length === 0 && (
                  <div className="py-8 text-center text-[12.5px] text-[var(--text-muted)] space-y-3">
                    {repos.length === 0 ? (
                      <>
                        <p>No repositories mirrored yet -- sync from GitHub first.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-8 text-[12px] mx-auto"
                          onClick={() => syncAll.mutate()}
                          isLoading={syncAll.isPending}
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Sync repositories from GitHub
                        </Button>
                      </>
                    ) : (
                      <p>No repositories match your search.</p>
                    )}
                  </div>
                )}
                {filtered.map(repo => {
                  const isSelected = selected?.fullName === repo.fullName
                  return (
                    <button
                      key={repo.fullName}
                      onClick={() => pick(repo)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors',
                        isSelected ? 'bg-[var(--accent-soft)]/50' : 'hover:bg-[var(--bg-hover)]'
                      )}
                    >
                      <Github className={cn('w-4 h-4 shrink-0', isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')} strokeWidth={1.5} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{repo.fullName}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {repo.isPrivate ? 'Private' : 'Public'}   branch {repo.defaultBranch || 'main'}   {repo.openPullRequests ?? 0} open PRs
                        </p>
                      </div>
                      <span className={cn(
                        'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                        isSelected ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[var(--border-default)]'
                      )}>
                        {isSelected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Details (prefilled from repo) */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="space-y-3 rounded-xl border border-[var(--accent-border)]/60 bg-[var(--accent-soft)]/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <Text size="sm" className="font-semibold flex items-center gap-2">
                      <Github className="w-3.5 h-3.5 text-[var(--accent)]" /> {selected.fullName}
                    </Text>
                    <a
                      href={`https://github.com/${selected.fullName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] inline-flex items-center gap-1"
                    >
                      Open on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">Project name</label>
                      <Input value={name} onChange={e => setName(e.target.value)} className="h-9 text-[13px]" />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">Description</label>
                      <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" className="h-9 text-[13px]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => handleClose(false)} className="h-9 text-[12.5px]">Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={!selected}
                isLoading={createMutation.isPending}
                className="gap-1.5 h-9 text-[12.5px] shadow-sm"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
                {!createMutation.isPending && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}

export default CreateFromGithubModal
