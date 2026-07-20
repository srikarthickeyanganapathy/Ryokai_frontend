import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as goalsApi from '../api/goals.api'
import { queryKeys } from '@/shared/api/queryKeys'
import { toast } from 'sonner'

export const useGoals = (orgId) => useQuery({
  queryKey: queryKeys.goals.list(orgId),
  queryFn: () => goalsApi.getGoals(orgId),
  enabled: !!orgId,
})

export const useCreateGoal = (orgId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => goalsApi.createGoal(orgId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.goals.list(orgId) }),
    onError: (e) => toast.error(e.response?.data?.message || 'Could not create goal'),
  })
}

export const useUpdateGoal = (orgId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ goalId, payload }) => goalsApi.updateGoal(orgId, goalId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.goals.list(orgId) }),
    onError: (e) => toast.error(e.response?.data?.message || 'Could not update goal'),
  })
}

export const useDeleteGoal = (orgId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (goalId) => goalsApi.deleteGoal(orgId, goalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.goals.list(orgId) }),
    onError: (e) => toast.error(e.response?.data?.message || 'Could not delete goal'),
  })
}
