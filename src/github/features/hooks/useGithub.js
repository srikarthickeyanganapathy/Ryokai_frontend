import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getGithubConfig,
  getGithubInstallations,
  getGithubRepos,
  getGithubPulls,
  getGithubCommits,
  syncGithubInstallation,
  syncAllGithub,
  refreshGithubPullRequest,
  connectGithub,
} from '../api/github.api';
import { githubQueryKeys } from '../../entities/model/querykeys';

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
    // revoked connection immediately — a stale `connected:true` would render
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

export const useGithubRepos = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: githubQueryKeys.repos,
    queryFn: getGithubRepos,
    retry: 1,
    onError: (e) => {
      if (isReconnectRequired(e)) reconnectQueryClient(queryClient);
      else if (isSsoRequired(e)) toast.error(errorMessage(e, 'GitHub authorization needed'));
    },
  });
};

export const useGithubPulls = (fullName) => {
  const queryClient = useQueryClient();
  const [owner, repo] = (fullName || '').split('/');
  return useQuery({
    queryKey: githubQueryKeys.pulls(fullName),
    queryFn: () => getGithubPulls(owner, repo, { refresh: true }),
    enabled: Boolean(fullName),
    staleTime: 30 * 1000,
    retry: 1,
    onError: (e) => {
      if (isReconnectRequired(e)) reconnectQueryClient(queryClient);
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

export const useSyncGithubInstallation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGithubInstallation,
    onSuccess: (result, installationId) => {
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.repos });
      queryClient.invalidateQueries({ queryKey: githubQueryKeys.installations });
      toast.success(
        `Synced ${result.repositories} repos · ${result.pullRequests} PRs · ${result.commits} commits`
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
        `Synced ${result.repositories} repos · ${result.pullRequests} PRs · ${result.commits} commits`
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