import api from '@/shared/api/api'

export const getWorkloadMatrix = (orgId) =>
  api.get(`/organizations/${orgId}/workload`).then(r => r.data)
