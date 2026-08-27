import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitPullRequest, Link2, Unlink, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react'
import { Loader2 } from '@/shared/ui/Icons'
import { Heading } from '@/shared/ui/Typography'
import { PageState } from '@/shared/ui/PageState'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select'
import {
  useTaskLinkedPulls, useLinkTaskPull, useUnlinkTaskPull,
  useGithubRepos, useGithubPulls, useGithubConfig,
} from '@/github'
import { useProject } from '@/project'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

/* ============================================================
   TaskPullLinks — link pull requests to a task (P2). Real data
   only: links come from GET /github/tasks/{id}/pulls, candidates
   from the repo mirror + PR mirror. Linking requires the PR to be
   mirrored (sync the repo first) — the backend enforces this and
   surfaces the reason.
   ============================================================ */

const STATE_CHIP = {
  open: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  merged: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  closed: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
}

export function TaskPullLinks({ taskId, projectId, crewId, hasEditPerm = false }) {
  const { workspaceMode } = useWorkspace()
  const { data: config } = useGithubConfig()
  const linksQuery = useTaskLinkedPulls(taskId)
  // Workspace separation: crew tasks only offer repos linked into the crew
  // project (the federated set); personal tasks offer the user's own repos.
  const isCrewTask = Boolean(crewId)
  const { data: project } = useProject(isCrewTask ? projectId : null)
  const { data: reposData } = useGithubRepos({ enabled: !isCrewTask })
  const linkMutation = useLinkTaskPull(taskId)
  const unlinkMutation = useUnlinkTaskPull(taskId)

  const [repo, setRepo] = useState('')
  const [prNumber, setPrNumber] = useState('')
  // Live fetch (refresh:true) - always shows the repo's current open PRs from
  // GitHub; the dropdown surfaces loading and error states explicitly.
  const pullsQuery = useGithubPulls(repo)

  const repos = useMemo(() => {
    if (isCrewTask) return Array.isArray(project?.linkedGithubRepos) ? project.linkedGithubRepos : []
    return Array.isArray(reposData?.repositories) ? reposData.repositories : []
  }, [isCrewTask, project, reposData])
  const openPulls = useMemo(() => {
    const list = Array.isArray(pullsQuery.data?.pullRequests) ? pullsQuery.data.pullRequests : []
    return list.filter((pr) => String(pr.state).toLowerCase() === 'open')
  }, [pullsQuery.data])

  const links = linksQuery.data || []
  const canLink = hasEditPerm && config?.connected && config?.appConfigured

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Heading level={4} className="text-base font-semibold">
          Pull Requests
        </Heading>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {links.length} {links.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Linked PRs List & State Handling */}
      <div className="space-y-3">
        {linksQuery.isLoading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
          </div>
        )}

        {linksQuery.isError && (
          <div className="py-8">
            <PageState
              state="error"
              stateProps={{
                icon: AlertCircle,
                title: 'Could not load pull requests',
                description: 'There was a problem loading linked pull requests for this task.',
                onRetry: () => linksQuery.refetch(),
              }}
            />
          </div>
        )}

        {!linksQuery.isLoading && !linksQuery.isError && links.length === 0 && (
          <div className="py-10">
            <PageState
              state="empty"
              stateProps={{
                icon: GitPullRequest,
                title: 'No Pull Requests Linked',
                message: 'Link the pull request that resolves this task to track its state and stats in real time.',
              }}
            />
          </div>
        )}

        {!linksQuery.isLoading && !linksQuery.isError && links.length > 0 && (
          <AnimatePresence initial={false}>
            {links.map((link) => (
              <motion.div
                key={`${link.repoFullName}#${link.prNumber}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 hover:border-[var(--accent-border)]/70 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                  <GitPullRequest className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate">
                      {link.title || `${link.repoFullName}#${link.prNumber}`}
                    </span>
                    {link.state && (
                      <span className={cn(
                        'inline-flex items-center px-1.5 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wide shrink-0',
                        STATE_CHIP[String(link.state).toLowerCase()] || STATE_CHIP.open
                      )}>
                        {String(link.state).toLowerCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                    <span className="font-mono">{link.repoFullName}</span>
                    <span className="text-[var(--border-subtle)]">·</span>
                    <span>#{link.prNumber}</span>
                    {link.authorLogin && (
                      <>
                        <span className="text-[var(--border-subtle)]">·</span>
                        <span>@{link.authorLogin}</span>
                      </>
                    )}
                    {link.linkedAt && (
                      <>
                        <span className="text-[var(--border-subtle)]">·</span>
                        <span>linked {new Date(link.linkedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                </div>
                {link.htmlUrl && (
                  <a
                    href={link.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                    aria-label={`Open pull request ${link.prNumber} on GitHub`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                )}
                {hasEditPerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-[var(--text-muted)] hover:text-red-500"
                    disabled={unlinkMutation.isPending}
                    onClick={() => unlinkMutation.mutate({ repoFullName: link.repoFullName, prNumber: link.prNumber })}
                  >
                    <Unlink className="w-3.5 h-3.5 mr-1" /> Unlink
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Link picker */}
      {canLink && (
        <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Link a pull request
          </p>
          {!config.connected ? (
            <p className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Connect your GitHub account (GitHub hub) to link pull requests.
            </p>
          ) : repos.length === 0 ? (
            <p className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {isCrewTask
                ? 'No repositories linked to this project yet - ask a member to link one (Crew sharing).'
                : 'No repositories mirrored - run "Sync repositories" on the GitHub hub first.'}
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[160px]">
                <Select value={repo} onValueChange={(v) => { setRepo(v); setPrNumber('') }}>
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder="Repository…" />
                  </SelectTrigger>
                  <SelectContent>
                    {repos.map((r) => {
                      const repoName = typeof r === 'string' ? r : r?.fullName;
                      if (!repoName) return null;
                      return <SelectItem key={repoName} value={repoName}>{repoName}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <Select value={prNumber} onValueChange={setPrNumber} disabled={!repo}>
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder={repo ? 'Open pull request…' : 'Select a repo first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {repo && pullsQuery.isLoading && (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                      </div>
                    )}
                    {repo && pullsQuery.isError && (
                      <div className="flex flex-col gap-1.5 px-3 py-2 min-w-[220px]">
                        <span className="flex items-center gap-1.5 text-[12px] text-red-500">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          Could not load pull requests
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {pullsQuery.error?.response?.data?.message || 'Sync repositories on the GitHub hub, then retry.'}
                        </span>
                        <Button variant="outline" size="sm" className="self-start" onClick={() => pullsQuery.refetch()}>
                          <RefreshCw className="w-3 h-3 mr-1" /> Retry
                        </Button>
                      </div>
                    )}
                    {repo && !pullsQuery.isLoading && !pullsQuery.isError && openPulls.length === 0 && (
                      <div className="px-3 py-2 text-[12px] text-[var(--text-muted)]">
                        No open pull requests in this repo
                      </div>
                    )}
                    {!repo && (
                      <div className="px-3 py-2 text-[12px] text-[var(--text-muted)]">
                        Select a repository first
                      </div>
                    )}
                    {openPulls.map((pr) => (
                      <SelectItem key={pr.prNumber} value={String(pr.prNumber)}>
                        #{pr.prNumber} · {pr.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className="h-9 px-4 shrink-0 font-semibold"
                disabled={!repo || !prNumber || linkMutation.isPending}
                onClick={() => linkMutation.mutate({ repoFullName: repo, prNumber: Number(prNumber) }, {
                  onSuccess: () => setPrNumber(''),
                })}
              >
                {linkMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Link2 className="w-3.5 h-3.5 mr-1.5" />}
                Link PR
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
