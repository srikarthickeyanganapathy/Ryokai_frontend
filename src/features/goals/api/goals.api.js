import api from '@/shared/api/api'

export const getGoals = (orgId) => api.get(`/organizations/${orgId}/goals`).then(r => r.data)
export const createGoal = (orgId, payload) => api.post(`/organizations/${orgId}/goals`, payload).then(r => r.data)
export const updateGoal = (orgId, goalId, payload) => api.put(`/organizations/${orgId}/goals/${goalId}`, payload).then(r => r.data)
export const deleteGoal = (orgId, goalId) => api.delete(`/organizations/${orgId}/goals/${goalId}`).then(r => r.data)
