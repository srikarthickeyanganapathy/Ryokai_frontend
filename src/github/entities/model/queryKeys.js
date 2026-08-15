/**
 * Canonical query keys for the GitHub App module (TanStack Query).
 */
export const githubQueryKeys = {
  all: ['github'],
  config: ['github', 'config'],
  installations: ['github', 'installations'],
  repos: ['github', 'repos'],
  pulls: (fullName, state) => ['github', 'pulls', fullName, state ?? 'all'],
  commits: (fullName, branch) => ['github', 'commits', fullName, branch ?? 'all'],
};