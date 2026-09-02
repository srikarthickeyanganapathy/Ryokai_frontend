import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { projectsApi } from '../api'
import { queryKeys } from '@/shared/api/queryKeys'
import { toast } from 'sonner'
import { markProgress, PROGRESS_KEYS } from '@/onboarding/model/progressBus'

export function useProjects(filters = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectsApi.getProjects(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getProjectById(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      toast.success('Project created successfully')
      markProgress(PROGRESS_KEYS.PROJECT_CREATED)
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create project')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => projectsApi.updateProject(id, updates),
    onSuccess: (data) => {
      toast.success('Project updated successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.setQueryData(queryKeys.projects.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update project')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      toast.success('Project deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete project')
    },
  })
}

export function useUnshareProjectFromCrew() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, crewId }) => projectsApi.unshareFromCrew(projectId, crewId),
    onSuccess: (_, { projectId }) => {
      toast.success('Project unshared from crew')
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to unshare project')
    },
  })
}

export function useProjectActivities(projectId) {
  return useQuery({
    queryKey: queryKeys.projects.activities(projectId),
    queryFn: () => projectsApi.getProjectActivities(projectId),
    enabled: !!projectId,
  })
}

export function useLinkGithubRepo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, repoFullName }) => projectsApi.linkGithubRepo(id, repoFullName),
    onSuccess: (project) => {
      toast.success('GitHub repository linked')
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(project.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to link repository')
    },
  })
}

export function useUnlinkGithubRepo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, repoFullName }) => projectsApi.unlinkGithubRepo(id, repoFullName),
    onSuccess: (project) => {
      toast.success('Repository unlinked')
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(project.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to unlink repository')
    },
  })
}
