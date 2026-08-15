/**
 * Canonical query keys for the GitHub App module (TanStack Query).
 */
export const githubQueryKeys = {
  all: ['github'],
  config: ['github', 'config'],
  installations: ['github', 'installations'],
  repos: ['github', 'repos'],
  repo: (fullName) => ['github', 'repo', fullName],
  pulls: (fullName, state) => ['github', 'pulls', fullName, state ?? 'all'],
  commits: (fullName, branch) => ['github', 'commits', fullName, branch ?? 'all'],
  contents: (fullName, path) => ['github', 'contents', fullName, path ?? ''],
  file: (fullName, path, ref) => ['github', 'file', fullName, path ?? '', ref ?? ''],
  taskPulls: (taskId) => ['github', 'tasks', taskId, 'pulls'],
};