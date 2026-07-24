export const mapUser = (dto) => {
  if (!dto) return null;
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    firstName: dto.firstName || '',
    lastName: dto.lastName || '',
    fullName: dto.firstName && dto.lastName ? `${dto.firstName} ${dto.lastName}` : dto.username,
    avatarUrl: dto.avatarUrl || null,
    isActive: dto.isActive !== false,
    createdAt: dto.createdAt || null,
  };
};

export const mapPermission = (dto) => {
  if (!dto) return null;
  // Based on PermissionResponseDTO
  return {
    id: dto.id,
    name: dto.name, // e.g., 'task:create'
    description: dto.description || '',
    resource: dto.resource || '', // e.g., 'task'
    action: dto.action || '', // e.g., 'create'
  };
};

export const mapRole = (dto) => {
  if (!dto) return null;
  // Based on RoleResponseDTO
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    isSystemRole: !!dto.isSystemRole,
    permissions: (dto.permissions || []).map(mapPermission),
  };
};
