import { useQuery } from '@tanstack/react-query'
import * as workloadApi from '../api/workload.api'
import { queryKeys } from '@/shared/api/queryKeys'

export const useWorkload = (orgId) => useQuery({
  queryKey: queryKeys.workload.matrix(orgId),
  queryFn: () => workloadApi.getWorkloadMatrix(orgId),
  enabled: !!orgId,
})
