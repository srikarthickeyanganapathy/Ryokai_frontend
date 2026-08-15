import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, GitPullRequest, GitCommitHorizontal, ExternalLink, Link2, Unlink, Github, Search, Loader2, UserPlus, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Input } from '@/shared/ui/Input'
import { useGithubRepos, useGithubConfig, useGithubConnect, useSyncAllGithub } from '@/github'
import { useLinkGithubRepo, useUnlinkGithubRepo } from '../features/hooks/useProjects'

/* ============================================================
   components/RepositoriesTab.jsx — the project's GitHub surface.
   Mirrors what the GitHub hub knows (repository_connections) and
   manages project_repository_links. No invented data: counts come
   from the real mirror.
   ============================================================ */

const REPO_META = (repo) => ({
  isPrivate: repo?.isPrivate,
  defaultBranch: repo?.defaultBranch || 'main',
  openPrs: repo?.openPullRequests ?? 0,
  mergedPrs: repo?.mergedPullRequests ?? 0,
})

function RepoChip({ fullName, repo, onUnlink, canManage }) {
  const meta = REPO_META(repo)
  const [owner, name] = fullName.split('/')
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="group relative flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3 hover:border-[var(--accent-border)]/70 hover:shadow-[var(--shadow-sm)] transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 group-hover:border-[var(--accent-border)]/60 transition-colors">
        <Github className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{name}</span>
          <Badge variant={meta.isPrivate ? 'warning' : 'outline'} size="xs" className="uppercase tracking-wider font-mono shrink-0">
            {meta.isPrivate ? 'Private' : 'Public'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
          <span className="font-mono">{owner}</span>
          <span className="text-[var(--border-subtle)]">/</span>
          <span className="font-mono">branch: {meta.defaultBranch}</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[10.5px] font-semibold text-[var(--text-secondary)]">
          <GitPullRequest className="w-3 h-3" /> {meta.openPrs} open
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[10.5px] font-semibold text-[var(--text-secondary)]">
          <GitBranch className="w-3 h-3" /> {meta.mergedPrs} merged
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <a
          href={`https://github.com/${fullName}`}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]/50 transition-colors"
          title="Open on GitHub"
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
        </a>
        {canManage && (
          <button
            onClick={() => onUnlink(fullName)}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
            title="Unlink repository"
          >
            <Unlink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function RepositoriesTab({ project, canManage }) {
  const linked = useMemo(() => Array.isArray(project?.linkedGithubRepos) ? project.linkedGithubRepos : [], [project])
  const { data: config } = useGithubConfig()
  const {
    data: reposData = {},
    isLoading: reposLoading,
    error: reposError,
    refetch: refetchRepos,
  } = useGithubRepos()
  const connect = useGithubConnect()
  const syncAll = useSyncAllGithub()
  const linkMutation = useLinkGithubRepo()
  const unlinkMutation = useUnlinkGithubRepo()

  const [showPicker, setShowPicker] = useState(false)
  const [query, setQuery] = useState('')

  // /github/repos returns { connected, repositories } — normalize the array.
  const repos = useMemo(() => (Array.isArray(reposData?.repositories) ? reposData.repositories : []), [reposData])

  const mirrorByFullName = useMemo(() => {
    const map = {}
    repos.forEach(r => { map[r.fullName] = r })
    return map
  }, [repos])

  const candidates = useMemo(() => {
    const all = repos.map(r => r.fullName).filter(Boolean)
    return all.filter(name => !linked.includes(name))
      .filter(name => name.toLowerCase().includes(query.trim().toLowerCase()))
  }, [repos, linked, query])

  const handleLink = (fullName) => {
    linkMutation.mutate({ id: project.id, repoFullName: fullName }, {
      onSuccess: () => { setShowPicker(false); setQuery('') },
    })
  }

  const handleUnlink = (fullName) => {
    unlinkMutation.mutate({ id: project.id, repoFullName: fullName })
  }

  const busy = linkMutation.isPending || unlinkMutation.isPending

  if (!config?.appConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
          <Github className="w-6 h-6 text-[var(--text-tertiary)]" strokeWidth={1.5} />
        </div>
        <Text className="font-semibold text-[14px]">GitHub is not configured</Text>
        <Text variant="muted" size="sm" className="max-w-sm mt-1">
          Connect your GitHub App first to link repositories to this project.
        </Text>
      </div>
    )
  }

  if (reposError) {
    const isSso = reposError?.response?.data?.error === 'github_sso_required'
    const isAppConfig = reposError?.response?.data?.error === 'github_app_config_invalid'
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
          <Github className="w-6 h-6 text-[var(--danger)]" strokeWidth={1.5} />
        </div>
        <Text className="font-semibold text-[14px]">{isAppConfig ? 'GitHub App not configured' : 'GitHub repositories unavailable'}</Text>
        <Text variant="muted" size="sm" className="max-w-sm mt-1">
          {reposError?.response?.data?.message || 'Failed to load repositories from GitHub.'}
        </Text>
        {isSso ? (
          <a
            href="https://github.com/settings/connections/applications"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex"
          >
            <Button size="sm" className="gap-1.5 h-8 text-[12px]">
              <ExternalLink className="w-3.5 h-3.5" /> Authorize in GitHub settings
            </Button>
          </a>
        ) : isAppConfig ? (
          <a href="https://github.com/settings/apps" target="_blank" rel="noreferrer" className="mt-4 inline-flex">
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-[12px]">
              <ExternalLink className="w-3.5 h-3.5" /> Fix app credentials on GitHub
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" className="mt-4 gap-1.5 h-8 text-[12px]" onClick={() => refetchRepos()}>
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        )}
      </div>
    )
  }

  // Linear model: the CURRENT user must connect their own GitHub account first —
  // another user's connection is never visible or linkable from here. Trust the
  // repos response's `connected` flag too (it is authoritative after a revoke).
  if (config?.connected !== true || reposData?.connected === false) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-[var(--accent)]" strokeWidth={1.5} />
        </div>
        <Text className="font-semibold text-[14px]">Connect your GitHub account</Text>
        <Text variant="muted" size="sm" className="max-w-sm mt-1">
          GitHub repositories are personal — authorize with your own GitHub identity to link repositories to this project.
        </Text>
        <Button size="sm" className="mt-4 gap-1.5 h-8 text-[12px]" onClick={() => connect.mutate()} isLoading={connect.isPending}>
          <UserPlus className="w-3.5 h-3.5" /> Connect GitHub Account
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-secondary)]">
          <GitCommitHorizontal className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
          <span>
            <strong className="text-[var(--text-primary)] font-semibold">{linked.length}</strong> linked{' '}
            {linked.length === 1 ? 'repository' : 'repositories'} · mirrored from GitHub
          </span>
        </div>
        {canManage && linked.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-7 text-[11px]"
            onClick={() => setShowPicker(v => !v)}
          >
            <Link2 className="w-3 h-3" /> Link Repository
          </Button>
        )}
      </div>

      {/* Link picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[var(--accent-border)]/60 bg-[var(--accent-soft)]/30 p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                <Input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search connected repositories..."
                  className="h-8 text-[12.5px] bg-[var(--bg-base)]"
                />
              </div>
              <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                {reposLoading && (
                  <div className="flex items-center justify-center py-4 text-[var(--text-muted)]">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Syncing repository list…
                  </div>
                )}
                {!reposLoading && candidates.length === 0 && (
                  <div className="text-center text-[12px] text-[var(--text-muted)] py-3 space-y-2.5">
                    {repos.length === 0 ? (
                      <>
                        <p>No repositories mirrored yet.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-7 text-[11px] mx-auto"
                          onClick={() => syncAll.mutate()}
                          isLoading={syncAll.isPending}
                        >
                          <RefreshCw className="w-3 h-3" /> Sync repositories from GitHub
                        </Button>
                      </>
                    ) : (
                      <p>All connected repositories are already linked.</p>
                    )}
                  </div>
                )}
                {candidates.map(name => (
                  <button
                    key={name}
                    onClick={() => handleLink(name)}
                    disabled={busy}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-[var(--bg-hover)] disabled:opacity-60 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" strokeWidth={1.5} />
                    <span className="text-[12.5px] font-medium text-[var(--text-primary)] truncate">{name}</span>
                    <span className="ml-auto text-[10.5px] font-mono text-[var(--text-muted)] shrink-0">
                      {REPO_META(mirrorByFullName[name]).defaultBranch}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Linked list */}
      {linked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-subtle)]/20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.25, ease: 'easeOut' }}
            className="relative w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center mb-4"
          >
            <Link2 className="w-6 h-6 text-[var(--text-tertiary)]" strokeWidth={1.5} />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
              <Github className="w-3 h-3 text-[var(--text-muted)]" strokeWidth={1.5} />
            </span>
          </motion.div>
          <Text className="font-semibold text-[14px]">No repositories linked</Text>
          <Text variant="muted" size="sm" className="max-w-xs mt-1">
            {canManage
              ? 'Link a connected GitHub repository to track its pull requests and commits right here.'
              : 'A project member can link GitHub repositories here.'}
          </Text>
          {canManage && repos.length > 0 && (
            <Button size="sm" className="mt-4 gap-1.5 h-8 text-[12px]" onClick={() => setShowPicker(true)}>
              <Link2 className="w-3.5 h-3.5" /> Link first repository
            </Button>
          )}
          {canManage && repos.length === 0 && (
            <Button size="sm" className="mt-4 gap-1.5 h-8 text-[12px]" onClick={() => syncAll.mutate()} isLoading={syncAll.isPending}>
              <RefreshCw className="w-3.5 h-3.5" /> Sync repositories from GitHub
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {linked.map(name => (
              <RepoChip
                key={name}
                fullName={name}
                repo={mirrorByFullName[name]}
                onUnlink={handleUnlink}
                canManage={canManage}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default RepositoriesTab
