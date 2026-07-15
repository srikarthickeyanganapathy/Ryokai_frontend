import api from '@/lib/api'

export const organizationsApi = {
  getOrganizations: async () => {
    const { data } = await api.get('/organizations')
    return data
  },

  getOrganizationById: async (id) => {
    const { data } = await api.get(`/organizations/${id}`)
    return data
  },

  createOrganization: async (orgData) => {
    const { data } = await api.post('/organizations', orgData)
    return data
  },

  inviteMember: async (id, memberData) => {
    const { data } = await api.post(`/organizations/${id}/invites`, memberData)
    return data
  },

  removeMember: async (id, userId) => {
    await api.delete(`/organizations/${id}/members/${userId}`)
  },

  getMembers: async (id) => {
    const { data } = await api.get(`/organizations/${id}/members`)
    return data
  },
  
  createTeam: async (id, teamData) => {
    const { data } = await api.post(`/organizations/${id}/teams`, teamData)
    return data
  },
  
  getTeams: async (id) => {
    const { data } = await api.get(`/organizations/${id}/teams`)
    return data
  }
}
