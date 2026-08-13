import api from '@/shared/api/api';

export const getGithubConfig = () => api.get('/github/config').then((r) => r.data);

export const connectGithub = () => api.post('/github/connect').then((r) => r.data);

export const getGithubInstallations = () => api.get('/github/installations').then((r) => r.data);

export const syncGithubInstallation = (installationId) =>
  api.post(`/github/installations/${installationId}/sync`).then((r) => r.data);

export const getGithubRepos = () => api.get('/github/repos').then((r) => r.data);

export const getGithubPulls = (owner, repo, { state, refresh = false } = {}) =>
  api
    .get(`/github/repos/${owner}/${repo}/pulls`, { params: { state, refresh } })
    .then((r) => r.data);

export const getGithubCommits = (owner, repo, { branch, refresh = false } = {}) =>
  api
    .get(`/github/repos/${owner}/${repo}/commits`, { params: { branch, refresh } })
    .then((r) => r.data);

export const refreshGithubPullRequest = (owner, repo, number) =>
  api.post(`/github/repos/${owner}/${repo}/pulls/${number}/refresh`).then((r) => r.data);