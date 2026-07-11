import api from '@/lib/api';

// --- Roles ---

export const getRoles = async () => {
  const { data } = await api.get('/admin/roles');
  return data;
};

export const createRole = async (roleData) => {
  // roleData: { name, description }
  const { data } = await api.post('/admin/roles', roleData);
  return data;
};

export const updateRole = async (roleId, roleData) => {
  // roleData: { name, description }
  const { data } = await api.put(`/admin/roles/${roleId}`, roleData);
  return data;
};

export const deleteRole = async (roleId) => {
  const { data } = await api.delete(`/admin/roles/${roleId}`);
  return data;
};

// --- Permissions ---

export const getPermissions = async () => {
  const { data } = await api.get('/admin/permissions');
  return data;
};

export const getRolePermissions = async (roleId) => {
  const { data } = await api.get(`/admin/roles/${roleId}/permissions`);
  return data;
};

export const assignRolePermissions = async (roleId, permissionNames) => {
  // permissionNames: string[] e.g. ["TASK_VIEW", "TASK_EDIT", "TASK_ASSIGN"]
  // Backend expects AssignPermissionsRequestDTO: { permissionNames: List<String> }
  const { data } = await api.put(`/admin/roles/${roleId}/permissions`, { permissionNames });
  return data;
};

// --- Organizations (Super Admin) ---

export const getAdminOrganizations = async () => {
  const { data } = await api.get('/admin/organizations');
  return data;
};

export const getAdminOrganization = async (orgId) => {
  const { data } = await api.get(`/admin/organizations/${orgId}`);
  return data;
};

export const suspendOrganization = async (orgId) => {
  const { data } = await api.post(`/admin/organizations/${orgId}/suspend`);
  return data;
};

export const activateOrganization = async (orgId) => {
  const { data } = await api.post(`/admin/organizations/${orgId}/activate`);
  return data;
};

export const deleteOrganization = async (orgId) => {
  await api.delete(`/admin/organizations/${orgId}`);
};

// --- Users (Admin Role Assignment) ---

export const assignUserRoles = async (userId, roleNames) => {
  // roleNames: List<String>
  const { data } = await api.put(`/admin/users/${userId}/roles`, roleNames);
  return data;
};
