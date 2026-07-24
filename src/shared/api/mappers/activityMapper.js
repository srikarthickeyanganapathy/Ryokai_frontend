import { mapDate } from './baseMapper';

export const mapActivityEvent = (dto) => {
  if (!dto) return null;

  return {
    id: dto.id,
    taskId: dto.taskId,
    taskTitle: dto.taskTitle || '',
    type: dto.eventType || 'UNKNOWN',
    fromStatus: dto.fromStatus || null,
    toStatus: dto.toStatus || null,
    reason: dto.reason || '',
    actor: {
      id: dto.actor?.id,
      username: dto.actor?.username || 'System',
      fullName: dto.actor?.fullName || dto.actor?.username || 'System',
      avatarUrl: dto.actor?.avatarUrl || null,
    },
    timestamp: mapDate(dto.occurredAt),
    relativeTime: dto.relativeTime || '',
  };
};
