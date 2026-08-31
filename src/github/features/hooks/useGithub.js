import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRealtime } from '@/app/providers/RealTimeProvider';
import {
  getGithubConfig,
  getGithubInstallations,
  getGithubRepos,
  getGithubRepo,
  refreshGithubRepo,
  getGithubPulls,
  getGithubCommits,
  getGithubContents,
  getTaskLinkedPulls,
  linkTaskPull,
  unlinkTaskPull,
  getGithubFile,
  writeGithubFile,
  createGithubBranch,
  openGithubPullRequest,
  syncGithubInstallation,
  syncAllGithub,
  refreshGithubPullRequest,
  connectGithub,
} from '../api/github.api';
import { githubQueryKeys } from '../../entities/model/queryKeys';

const errorMessage = (e, fallback) => e?.response?.data?.message || e?.message || fallback;

// Backend signals a revoked GitHub connection (token invalid) with this code and
// deletes the connection row - the UI must flip back to the Connect CTA.
const isReconnectRequired = (e) => e?.response?.data?.error === 'github_reconnect_required';

// Backend keeps the connection but the token lacks SAML SSO authorization for an
// org the user belongs to - surface an actionable message, do NOT flip to Connect.
const isSsoRequired = (e) => e?.response?.data?.error === 'github_sso_required';

const reconnectQueryClient = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: githubQueryKeys.config });
  queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos });
  queryClient.invalidateQueries({ queryKey: githubQueryKeys.installations });
};

export const useGithubConfig = () =>
  useQuery({
    queryKey: githubQueryKeys.config,
    queryFn: getGithubConfig,
    // No staleTime: the config endpoint is a cheap DB read and must reflect a
    // revoked connection immediately -- a stale `connected:true` would render
    // the wrong state (e.g. "Sync Repositories Now" after the user revokes
    // the OAuth grant on GitHub).
    retry: 1, // avoid 4x15s pile-ups when the backend is slow or failing
  });

/**
 * Linear-style per-user connect: opens the GitHub OAuth page for the CURRENT
 * user. After approval GitHub redirects back to /app/github?connected=1 and the
 * queries below refetch with the new connection.
 */
export const useGithubConnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectGithub,
    onSuccess: ({ connectUrl }) => {
      if (connectUrl) {
        window.open(connectUrl, '_blank', 'noopener,noreferrer');
      }
      // The OAuth round-trip invalidates the old "not connected" state.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: githubQueryKeys.config });
        queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos });
        queryClient.invalidateQueries({ queryKey: githubQueryKeys.installations });
      }, 1500);
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not start GitHub connect')),
  });
};

export const useGithubInstallations = () =>
  useQuery({
    queryKey: githubQueryKeys.installations,
    queryFn: getGithubInstallations,
    retry: 1,
  });

export const useGithubRepos = (options = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: githubQueryKeys.repos,
    queryFn: getGithubRepos,
    retry: 1,
    ...options,
    onError: (e) => {
      if (isReconnectRequired(e)) reconnectQueryClient(queryClient);
      else if (isSsoRequired(e)) toast.error(errorMessage(e, 'GitHub authorization needed'));
      options.onError?.(e);
    },
  });
};

/**
 * Metadata for ONE repo (permissions/default branch). Used by crew sharing so the
 * panel only loads the project's LINKED repos - never the user's full repo list.
 */
export const useGithubRepo = (fullName, options = {}) => {
  const queryClient = useQueryClient();
  const [owner, repo] = (fullName || '').split('/');
  return useQuery({
    queryKey: githubQueryKeys.repo(fullName),
    queryFn: () => getGithubRepo(owner, repo),
    enabled: Boolean(fullName) && Boolean(owner) && Boolean(repo),
    retry: 1,
    staleTime: 30 * 1000,
    ...options,
    onError: (e) => {
      if (isReconnectRequired(e)) reconnectQueryClient(queryClient);
      options.onError?.(e);
    },
  });
};

/** Refreshes ONE repo's metadata from GitHub (scoped sync - only the repos shown). */
export const useRefreshGithubRepo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fullName) => {
      const [owner, repo] = fullName.split('/');
      return refreshGithubRepo(owner, repo);
    },
    onSuccess: (data, fullName) => {
      queryClient.setQueryData(githubQueryKeys.repo(fullName), data);
    },
  });
};

export const useGithubPulls = (fullName, options = {}) => {
  const queryClient = useQueryClient();
  const [owner, repo] = (fullName || '').split('/');
  const refresh = options.refresh ?? true;
  return useQuery({
    queryKey: githubQueryKeys.pulls(fullName),
    queryFn: () => getGithubPulls(owner, repo, { refresh }),
    enabled: Boolean(fullName),
    staleTime: 30 * 1000,
    retry: 1,
    ...options,
    onError: (e) => {
      if (isReconnectRequired(e)) reconnectQueryClient(queryClient);
      options.onError?.(e);
    },
  });
};

export const useGithubCommits = (fullName) => {
  const queryClient = useQueryClient();
  const [owner, repo] = (fullName || '').split('/');
  return useQuery({
    queryKey: githubQueryKeys.commits(fullName),
    queryFn: () => getGithubCommits(owner, repo, { refresh: true }),
    enabled: Boolean(fullName),
    staleTime: 30 * 1000,
    retry: 1,
    onError: (e) => {
      if (isReconnectRequired(e)) reconnectQueryClient(queryClient);
    },
  });
};

export const useGithubContents = (fullName, path) => {
  const [owner, repo] = (fullName || '').split('/');
  return useQuery({
    queryKey: githubQueryKeys.contents(fullName, path),
    queryFn: () => getGithubContents(owner, repo, path),
    enabled: Boolean(fullName),
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useTaskLinkedPulls = (taskId) => {
  return useQuery({
    queryKey: githubQueryKeys.taskPulls(taskId),
    queryFn: () => getTaskLinkedPulls(taskId),
    enabled: Boolean(taskId),
    retry: 1,
  });
};

export const useLinkTaskPull = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repoFullName, prNumber }) => linkTaskPull(taskId, repoFullName, prNumber),
    onSuccess: () => {
      toast.success('Pull request linked to task');
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.taskPulls(taskId) });
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not link pull request')),
  });
};

export const useUnlinkTaskPull = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repoFullName, prNumber }) => {
      const [owner, repo] = repoFullName.split('/');
      return unlinkTaskPull(taskId, owner, repo, prNumber);
    },
    onSuccess: () => {
      toast.success('Pull request unlinked');
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.taskPulls(taskId) });
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not unlink pull request')),
  });
};

export const useGithubFile = (fullName, path, ref) => {
  const [owner, repo] = (fullName || '').split('/');
  return useQuery({
    queryKey: githubQueryKeys.file(fullName, path, ref),
    queryFn: () => getGithubFile(owner, repo, path, ref),
    enabled: Boolean(fullName && path),
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useWriteGithubFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fullName, payload }) => {
      const [owner, repo] = fullName.split('/');
      return writeGithubFile(owner, repo, payload);
    },
    onSuccess: () => {
      toast.success('Committed to GitHub');
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos });
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not commit the file')),
  });
};

export const useCreateGithubBranch = () => {
  return useMutation({
    mutationFn: ({ fullName, name, base }) => {
      const [owner, repo] = fullName.split('/');
      return createGithubBranch(owner, repo, name, base);
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not create the branch')),
  });
};

export const useOpenGithubPullRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fullName, payload }) => {
      const [owner, repo] = fullName.split('/');
      return openGithubPullRequest(owner, repo, payload);
    },
    onSuccess: (data) => {
      toast.success(`Pull request #${data?.number || ''} opened`);
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos });
    },
    onError: (e) => toast.error(errorMessage(e, 'Could not open the pull request')),
  });
};

export const useGithubLiveEvents = (repoFullNames) => {
  const { subscribeToTopic } = useRealtime()
  const queryClient = useQueryClient()
  const names = Array.isArray(repoFullNames)
    ? repoFullNames.filter(Boolean)
    : repoFullNames
      ? [repoFullNames]
      : []
  const key = names.join(',')
  // Coalesce bursts (multi-repo syncs, webhook fan-out) into one refetch per repo -
  // prevents a storm of invalidations from hammering the backend.
  const timers = useRef({})
  useEffect(() => {
    if (names.length === 0) return undefined
    const unsubs = names.map((fullName) =>
      subscribeToTopic(`/topic/github/${fullName}`, () => {
        clearTimeout(timers.current[fullName])
        timers.current[fullName] = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: githubQueryKeys.pulls(fullName) })
          queryClient.invalidateQueries({ queryKey: githubQueryKeys.commits(fullName) })
          queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos })
        }, 800)
      })
    )
    return () => {
      unsubs.forEach((unsub) => unsub?.())
      Object.values(timers.current).forEach(clearTimeout)
      timers.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, subscribeToTopic, queryClient])
}

export const useSyncGithubInstallation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGithubInstallation,
    onSuccess: (result, installationId) => {
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos });
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.installations });
      toast.success(
        `Synced ${result.repositories} repos   ${result.pullRequests} PRs   ${result.commits} commits`
      );
    },
    onError: (e) => {
      if (isReconnectRequired(e)) {
        reconnectQueryClient(queryClient);
        toast.error(errorMessage(e, 'GitHub sync failed'));
        return;
      }
      if (isSsoRequired(e)) {
        toast.error(errorMessage(e, 'GitHub sync failed'));
        return;
      }
      toast.error(errorMessage(e, 'GitHub sync failed'));
    },
  });
};

export const useSyncAllGithub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncAllGithub,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos });
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.installations });
      toast.success(
        `Synced ${result.repositories} repos   ${result.pullRequests} PRs   ${result.commits} commits`
      );
    },
    onError: (e) => {
      if (isReconnectRequired(e)) {
        reconnectQueryClient(queryClient);
        toast.error(errorMessage(e, 'GitHub sync failed'));
        return;
      }
      if (isSsoRequired(e)) {
        toast.error(errorMessage(e, 'GitHub sync failed'));
        return;
      }
      toast.error(errorMessage(e, 'GitHub sync failed'));
    },
  });
};

export const useRefreshGithubPullRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ owner, repo, number }) => refreshGithubPullRequest(owner, repo, number),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: githubQueryKeys.pulls(`${vars.owner}/${vars.repo}`),
      });
      toast.success(`PR #${vars.number} updated`);
    },
    onError: (e) => toast.error(errorMessage(e, 'Refresh failed')),
  });
};