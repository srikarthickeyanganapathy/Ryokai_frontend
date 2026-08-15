import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, GitPullRequest, GitCommitHorizontal, RefreshCw, PlugZap, FolderTree } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { PageShell, PageHero, PageStats, PageToolbar, PageContent } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import { Button } from '@/shared/ui/Button';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import {
  useGithubConfig,
  useGithubInstallations,
  useGithubRepos,
  useGithubPulls,
  useGithubCommits,
  useSyncGithubInstallation,
  useSyncAllGithub,
  useGithubConnect,
  useGithubLiveEvents,
} from '@/github';
import { GithubOnboarding } from '@/github/features/components/GithubOnboarding';
import { RepoList } from '@/github/features/components/RepoList';
import { PullRequestList } from '@/github/features/components/PullRequestList';
import { CommitList } from '@/github/features/components/CommitList';
import { FileTree } from '@/github/features/components/FileTree';

function StatCard({ label, value, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 px-4 py-3.5"
    >
      <div className={cn('text-2xl font-bold tabular-nums tracking-tight', accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">{label}</div>
    </motion.div>
  );
}

export function GithubPage() {
  const { workspaceMode } = useWorkspace();

  const { data: config, isLoading: configLoading } = useGithubConfig();
  const { data: installations = [] } = useGithubInstallations();
  const { data: reposData, isLoading: reposLoading, isError, error, refetch } = useGithubRepos();
  const syncInstallation = useSyncGithubInstallation();
  const syncAll = useSyncAllGithub();
  const connect = useGithubConnect();

  const [selectedFullName, setSelectedFullName] = useState(null);
  const [tab, setTab] = useState('pulls');
  const [syncingInstallation, setSyncingInstallation] = useState(null);

  const repos = useMemo(() => reposData?.repositories || [], [reposData]);

  useEffect(() => {
    if (!selectedFullName && repos.length > 0) {
      setSelectedFullName(repos[0].fullName);
    }
  }, [repos, selectedFullName]);

  const pullsQuery = useGithubPulls(selectedFullName);
  const commitsQuery = useGithubCommits(selectedFullName);
  const pullRequests = pullsQuery.data?.pullRequests || [];
  const commits = commitsQuery.data?.commits || [];

  // Live PR/commit updates via STOMP for the currently selected repository.
  useGithubLiveEvents(selectedFullName);

  const stats = useMemo(() => {
    const open = repos.reduce((sum, r) => sum + (r.openPullRequests || 0), 0);
    const merged = repos.reduce((sum, r) => sum + (r.mergedPullRequests || 0), 0);
    return { repos: repos.length, open, merged, installations: installations.length };
  }, [repos, installations]);

  if (configLoading || reposLoading) {
    return (
      <PageShell workspaceMode={workspaceMode}>
        <PageState state="loading" stateProps={{ loadingVariant: 'dashboard' }} />
      </PageShell>
    );
  }

  if (isError && error?.response?.data?.error !== 'github_reconnect_required') {
    return (
      <PageShell workspaceMode={workspaceMode}>
        <PageHero
          eyebrow="GitHub App"
          title="GitHub"
          subtitle="Pull requests and commits, mirrored from GitHub."
          icon={Github}
        />
        <PageState
          state="error"
          action={<Button variant="secondary" size="sm" onClick={() => refetch()}>Try again</Button>}
        />
      </PageShell>
    );
  }

  const appConfigured = config?.appConfigured === true;
  // The repos response carries the authoritative `connected` flag — a revoked
  // connection shows up there (200 + connected:false) before config ever
  // refetches, so trust it too. reconnectRequired covers the 401 path.
  const reconnectRequired = error?.response?.data?.error === 'github_reconnect_required';
  const needsConnect =
    appConfigured &&
    (config?.connected !== true || reposData?.connected === false || reconnectRequired);

  const handleSyncInstallation = async (installationId) => {
    setSyncingInstallation(installationId);
    try {
      await syncInstallation.mutateAsync(installationId);
    } finally {
      setSyncingInstallation(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingInstallation('all');
    try {
      await syncAll.mutateAsync();
    } finally {
      setSyncingInstallation(null);
    }
  };

  const handleConnect = async () => {
    try {
      await connect.mutateAsync();
    } catch {
      // toast already shown by the mutation
    }
  };

  const heroActions = appConfigured && (
    <div className="flex items-center gap-2">
      {config?.connected ? (
        <>
          {(installations.length > 0 || repos.length > 0) && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={syncingInstallation === 'all'}
              onClick={handleSyncAll}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
              Sync all
            </Button>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)]/60 bg-[var(--accent-soft)]/50 px-3 py-1.5 text-[11.5px] font-medium text-[var(--accent)]">
            <Github className="h-3.5 w-3.5" strokeWidth={1.5} />
            Connected as @{config.githubLogin}
          </span>
        </>
      ) : (
        <Button variant="primary" size="sm" isLoading={connect.isPending} onClick={handleConnect}>
          <PlugZap className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
          Connect GitHub Account
        </Button>
      )}
    </div>
  );

  return (
    <PageShell workspaceMode={workspaceMode} maxWidth="wide">
      <PageHero
        eyebrow="GitHub App"
        title="GitHub"
        subtitle="Pull requests and commits, mirrored into Ryokai — reviewed without leaving the workspace."
        icon={Github}
        actions={heroActions}
      />

      {!appConfigured ? (
        <PageContent>
          <GithubOnboarding installUrl={config?.installUrl || null} />
        </PageContent>
      ) : needsConnect ? (
        <PageContent>
          <GithubOnboarding
            installUrl={config?.installUrl || null}
            needsConnect
            onConnect={handleConnect}
            connecting={connect.isPending}
          />
        </PageContent>
      ) : repos.length === 0 ? (
        <PageContent>
          <GithubOnboarding
            installUrl={config?.installUrl || null}
            installationId={installations[0]?.installationId || null}
            onSync={handleSyncAll}
            isSyncing={syncingInstallation === 'all'}
          />
        </PageContent>
      ) : (
        <>
          <PageStats>
            <StatCard label="Repositories" value={stats.repos} />
            <StatCard label="Open PRs" value={stats.open} accent />
            <StatCard label="Merged PRs" value={stats.merged} />
            <StatCard label="Installations" value={stats.installations} />
          </PageStats>

          <PageToolbar>
            <div className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-1">
              <button
                onClick={() => setTab('pulls')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
                  tab === 'pulls' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                )}
              >
                <GitPullRequest className="h-3.5 w-3.5" strokeWidth={1.5} />
                Pull Requests
              </button>
              <button
                onClick={() => setTab('commits')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
                  tab === 'commits' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                )}
              >
                <GitCommitHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                Commits
              </button>
              <button
                onClick={() => setTab('files')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
                  tab === 'files' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                )}
              >
                <FolderTree className="h-3.5 w-3.5" strokeWidth={1.5} />
                Files
              </button>
            </div>
          </PageToolbar>

          <PageContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
              <RepoList
                repos={repos}
                selectedFullName={selectedFullName}
                onSelect={setSelectedFullName}
                isLoading={false}
              />
              <div className="min-h-[420px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/40 p-4">
                {selectedFullName && (
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <PlugZap className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
                      <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{selectedFullName}</span>
                    </div>
                  </div>
                )}
                {tab === 'pulls' ? (
                  <PullRequestList
                    pullRequests={pullRequests}
                    isLoading={pullsQuery.isLoading || pullsQuery.isFetching}
                    onRefreshAll={() => pullsQuery.refetch()}
                    isRefreshing={pullsQuery.isFetching && !pullsQuery.isLoading}
                  />
                ) : tab === 'commits' ? (
                  <CommitList
                    commits={commits}
                    isLoading={commitsQuery.isLoading || commitsQuery.isFetching}
                    onRefreshAll={() => commitsQuery.refetch()}
                    isRefreshing={commitsQuery.isFetching && !commitsQuery.isLoading}
                  />
                ) : (
                  <FileTree key={selectedFullName} fullName={selectedFullName} />
                )}
              </div>
            </div>
          </PageContent>
        </>
      )}
    </PageShell>
  );
}