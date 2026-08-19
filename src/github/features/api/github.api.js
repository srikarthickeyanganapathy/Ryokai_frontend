import api from '@/shared/api/api';

export const getGithubConfig = () => api.get('/github/config').then((r) => r.data);

export const connectGithub = () => api.post('/github/connect').then((r) => r.data);

export const getGithubInstallations = () => api.get('/github/installations', { timeout: 60000 }).then((r) => r.data);

export const syncGithubInstallation = (installationId) =>
  api.post(`/github/installations/${installationId}/sync`, null, { timeout: 0 }).then((r) => r.data);

export const syncAllGithub = () => api.post('/github/repos/sync', null, { timeout: 0 }).then((r) => r.data);

export const getGithubRepos = () => api.get('/github/repos', { timeout: 60000 }).then((r) => r.data);

export const getGithubRepo = (owner, repo) => api.get(`/github/repos/${owner}/${repo}`).then((r) => r.data);

export const refreshGithubRepo = (owner, repo) =>
  api.post(`/github/repos/${owner}/${repo}/refresh`, null, { timeout: 0 }).then((r) => r.data);

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

export const getGithubContents = (owner, repo, path) =>
  api
    .get(`/github/repos/${owner}/${repo}/contents`, { params: path ? { path } : {} })
    .then((r) => r.data);

export const getTaskLinkedPulls = (taskId) => api.get(`/github/tasks/${taskId}/pulls`).then((r) => r.data);

export const linkTaskPull = (taskId, repoFullName, prNumber) =>
  api.post(`/github/tasks/${taskId}/pulls`, { repoFullName, prNumber }).then((r) => r.data);

export const unlinkTaskPull = (taskId, owner, repo, number) =>
  api.delete(`/github/tasks/${taskId}/pulls/${owner}/${repo}/${number}`);

export const getGithubFile = (owner, repo, path, ref) =>
  api
    .get(`/github/repos/${owner}/${repo}/file`, { params: { path, ref } })
    .then((r) => r.data);

export const writeGithubFile = (owner, repo, payload) =>
  api.put(`/github/repos/${owner}/${repo}/file`, payload).then((r) => r.data);

export const createGithubBranch = (owner, repo, name, base) =>
  api.post(`/github/repos/${owner}/${repo}/branches`, { name, base }).then((r) => r.data);

export const openGithubPullRequest = (owner, repo, payload) =>
  api.post(`/github/repos/${owner}/${repo}/pulls`, payload).then((r) => r.data);