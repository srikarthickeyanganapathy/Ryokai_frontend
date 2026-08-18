import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch, GitPullRequest, GitCommitHorizontal, ExternalLink, Link2, Unlink, Github,
  Search, Loader2, UserPlus, RefreshCw, FolderTree, Radio
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Input } from '@/shared/ui/Input'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import {
  useGithubRepos, useGithubConfig, useGithubConnect, useSyncAllGithub,
  PullRequestList, CommitList, FileTree, useGithubLiveEvents, useGithubPulls, useGithubCommits
} from '@/github'
import { useLinkGithubRepo, useUnlinkGithubRepo } from '../features/hooks/useProjects'
import CrewRepoSharingPanel from '@/crew/components/CrewRepoSharingPanel'

/* ============================================================
   components/RepositoriesTab.jsx — the project's embedded GitHub
   workspace. Users work here: browse files, review pull requests,
   follow commits and edit/commit — without leaving the project.
   Linked repos come from the real mirror (no invented data).
   ============================================================ */

const REPO_META = (repo) => ({
  isPrivate: repo?.isPrivate,
  defaultBranch: repo?.defaultBranch || 'main',
  openPrs: repo?.openPullRequests ?? 0,
  mergedPrs: repo?.mergedPullRequests ?? 0,
})

const TABS = [
  { id: 'files', label: 'Files', icon: FolderTree },
  { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest },
  { id: 'commits', label: 'Commits', icon: GitCommitHorizontal },
]

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </span>
  )
}

function RepoRailItem({ fullName, repo, active, onClick }) {
  const meta = REPO_META(repo)
  const [, name] = fullName.split('/')
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors duration-150',
        active ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-hover)]'
      )}
      aria-current={active ? 'true' : undefined}
    >
      <span
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full transition-colors duration-150',
          active ? 'bg-[var(--accent)]' : 'bg-transparent'
        )}
      />
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors duration-150',
          active
            ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
        )}
      >
        <GitBranch className="h-3.5 w-3.5" strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-[12.5px] font-medium', active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
          {name}
        </span>
        <span className="block truncate text-[10.5px] font-mono text-[var(--text-tertiary)] mt-0.5">
          {fullName.split('/')[0]} · {meta.defaultBranch}
        </span>
      </span>
      {meta.openPrs > 0 && (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold shrink-0',
          active ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
        )}>
          <GitPullRequest className="h-2.5 w-2.5" /> {meta.openPrs}
        </span>
      )}
      {active && <LiveDot />}
    </button>
  )
}

export function RepositoriesTab({ project, canManage }) {
  const { workspaceMode } = useWorkspace()
  const linked = useMemo(() => Array.isArray(project?.linkedGithubRepos) ? project.linkedGithubRepos : [], [project])
  // Workspace separation: in a crew project ANY crew member can link their own
  // repos (federated model); unlink stays structural (creator only).
  // In personal mode the owner is directly the user — no sharing needed.
  // In ORG mode this tab is never rendered (guarded by ProjectTabs + ProjectDetailPage).
  const isCrewShared = workspaceMode === 'CREWS' && Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0
  const canLinkRepos = canManage || isCrewShared
  const { data: config } = useGithubConfig()
  const { data: reposData = {}, isLoading: reposLoading, error: reposError, refetch: refetchRepos } = useGithubRepos()
  const connect = useGithubConnect()
  const syncAll = useSyncAllGithub()

  // Federated read: in a crew-shared project a member WITHOUT their own GitHub
  // connection can still VIEW crew-shared repos (backend requireRepoViewAccess).
  // Linking/syncing/editing are actions and need a connection.
  const isConnected = config?.connected === true && reposData?.connected !== false
  const viewOnlyCrewMember = isCrewShared && !isConnected
  const viewOnlyBanner = viewOnlyCrewMember ? (
    <div className="flex items-start gap-2.5 rounded-xl border border-[var(--accent-border)]/50 bg-[var(--accent-soft)]/30 px-3.5 py-2.5">
      <UserPlus className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-[var(--text-primary)]">View-only crew access</p>
        <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed">
          You can browse repositories shared with your crew. Connect your GitHub account to link
          repos, sync and edit files.
        </p>
      </div>
      <Button size="sm" className="ml-auto shrink-0 gap-1.5 h-7 text-[11px]" onClick={() => connect.mutate()} isLoading={connect.isPending}>
        <UserPlus className="w-3 h-3" /> Connect
      </Button>
    </div>
  ) : null

  // Live updates: backend broadcasts PR/commit events on /topic/github/{repo}.
  useGithubLiveEvents(linked)
  const linkMutation = useLinkGithubRepo()
  const unlinkMutation = useUnlinkGithubRepo()

  const [showPicker, setShowPicker] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('files')

  const repos = useMemo(() => (Array.isArray(reposData?.repositories) ? reposData.repositories : []), [reposData])
  const mirrorByFullName = useMemo(() => {
    const map = {}
    repos.forEach((r) => { map[r.fullName] = r })
    return map
  }, [repos])

  // Keep the selected repo in sync with the linked set (it can shrink via unlink).
  const activeFullName = selected && linked.includes(selected) ? selected : (linked[0] || null)

  const candidates = useMemo(() => {
    const all = repos.map((r) => r.fullName).filter(Boolean)
    return all.filter((name) => !linked.includes(name))
      .filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
  }, [repos, linked, query])

  const pullsQuery = useGithubPulls(activeFullName)
  const commitsQuery = useGithubCommits(activeFullName)

  const handleLink = (fullName) => {
    linkMutation.mutate({ id: project.id, repoFullName: fullName }, {
      onSuccess: () => { setShowPicker(false); setQuery(''); setSelected(fullName) },
    })
  }
  const handleUnlink = (fullName) => {
    unlinkMutation.mutate({ id: project.id, repoFullName: fullName })
    if (selected === fullName) setSelected(null)
  }
  const busy = linkMutation.isPending || unlinkMutation.isPending

  const selectedMeta = REPO_META(mirrorByFullName[activeFullName])

  /* ------------------------- gate states ------------------------- */
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
          <a href="https://github.com/settings/connections/applications" target="_blank" rel="noreferrer" className="mt-4 inline-flex">
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

  if (!isConnected && !isCrewShared) {
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

  /* Link picker — rendered in BOTH the empty and workspace states so
     "Link first repository" actually opens the picker */
  const linkPicker = (
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
                onChange={(e) => setQuery(e.target.value)}
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
                      <Button size="sm" variant="outline" className="gap-1.5 h-7 text-[11px] mx-auto" onClick={() => syncAll.mutate()} isLoading={syncAll.isPending}>
                        <RefreshCw className="w-3 h-3" /> Sync repositories from GitHub
                      </Button>
                    </>
                  ) : (
                    <p>All connected repositories are already linked.</p>
                  )}
                </div>
              )}
              {candidates.map((name) => (
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
  )

  /* ------------------------- empty state ------------------------- */
  if (linked.length === 0) {
    return (
      <div className="space-y-4">
        {viewOnlyBanner}
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
              ? 'Link a connected GitHub repository to browse files, review pull requests and commit right here.'
              : 'A project member can link GitHub repositories here.'}
          </Text>
          {canLinkRepos && isConnected && repos.length > 0 && (
            <Button size="sm" className="mt-4 gap-1.5 h-8 text-[12px]" onClick={() => setShowPicker(true)}>
              <Link2 className="w-3.5 h-3.5" /> Link first repository
            </Button>
          )}
          {canLinkRepos && isConnected && repos.length === 0 && (
            <Button size="sm" className="mt-4 gap-1.5 h-8 text-[12px]" onClick={() => syncAll.mutate()} isLoading={syncAll.isPending}>
              <RefreshCw className="w-3.5 h-3.5" /> Sync repositories from GitHub
            </Button>
          )}
        </div>
        {linkPicker}
        {workspaceMode === 'CREWS' && Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0 && (
          <CrewRepoSharingPanel crewId={project.sharedCrewIds[0]} projectId={project.id} linkedRepos={linked} canManage={canManage} />
        )}
      </div>
    )
  }

  /* ------------------------- workspace ------------------------- */
  return (
    <div className="space-y-4">
      {viewOnlyBanner}
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-secondary)]">
          <GitCommitHorizontal className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
          <span>
            <strong className="text-[var(--text-primary)] font-semibold">{linked.length}</strong> linked{' '}
            {linked.length === 1 ? 'repository' : 'repositories'} · mirrored from GitHub
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-[11px]" onClick={() => syncAll.mutate()} isLoading={syncAll.isPending}>
              <RefreshCw className="w-3 h-3" /> Sync
            </Button>
          )}
          {canLinkRepos && isConnected && (
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-[11px]" onClick={() => setShowPicker((v) => !v)}>
              <Link2 className="w-3 h-3" /> Link Repository
            </Button>
          )}
        </div>
      </div>

      {/* Link picker */}
      {linkPicker}

      {/* Embedded workspace: repo rail + content pane */}
      <div className="grid grid-cols-1 lg:grid-cols-[264px_1fr] gap-4">
        {/* Rail */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-subtle)]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Repositories</span>
            <Badge size="xs" variant="outline" className="font-mono">{linked.length}</Badge>
          </div>
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible p-2">
            {linked.map((name) => (
              <div key={name} className="group relative min-w-[220px] lg:min-w-0 shrink-0">
                <RepoRailItem
                  fullName={name}
                  repo={mirrorByFullName[name]}
                  active={name === activeFullName}
                  onClick={() => setSelected(name)}
                />
                {canManage && (
                  <button
                    onClick={() => handleUnlink(name)}
                    title="Unlink repository"
                    className="absolute right-1.5 top-1.5 z-10 p-1 rounded-md text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-opacity"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[440px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/40 flex flex-col overflow-hidden">
          {/* Pane header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border-subtle)] flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate text-[13px] font-semibold text-[var(--text-primary)] font-mono">{activeFullName}</span>
              <Badge variant={selectedMeta.isPrivate ? 'warning' : 'outline'} size="xs" className="uppercase tracking-wider font-mono shrink-0">
                {selectedMeta.isPrivate ? 'Private' : 'Public'}
              </Badge>
            </div>
            <a
              href={`https://github.com/${activeFullName}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              Open on GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-3 pt-2.5 pb-0">
            {TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
                    tab === t.id ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t.label}
                  {t.id === 'pulls' && selectedMeta.openPrs > 0 && (
                    <span className="rounded bg-[var(--accent)]/10 px-1 text-[10px] font-semibold tabular-nums">{selectedMeta.openPrs}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0">
            {tab === 'files' && <FileTree key={activeFullName} fullName={activeFullName} />}
            {tab === 'pulls' && (
              <PullRequestList
                pullRequests={pullsQuery.data?.pullRequests || []}
                isLoading={pullsQuery.isLoading || pullsQuery.isFetching}
                onRefreshAll={() => pullsQuery.refetch()}
                isRefreshing={pullsQuery.isFetching && !pullsQuery.isLoading}
              />
            )}
            {tab === 'commits' && (
              <CommitList
                commits={commitsQuery.data?.commits || []}
                isLoading={commitsQuery.isLoading || commitsQuery.isFetching}
                onRefreshAll={() => commitsQuery.refetch()}
                isRefreshing={commitsQuery.isFetching && !commitsQuery.isLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Federated crew sharing — only in CREWS workspace mode when this project is shared with a crew */}
      {workspaceMode === 'CREWS' && Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0 && (
        <CrewRepoSharingPanel
          crewId={project.sharedCrewIds[0]}
          projectId={project.id}
          linkedRepos={linked}
          canManage={canManage}
        />
      )}
    </div>
  )
}

export default RepositoriesTab
