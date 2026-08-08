/**
 * Normalize calendar event DTO
 * @param {Object} event - Raw backend event
 * @returns {import('./types').CalendarEvent} Normalized event object
 */
export const normalizeCalendarEvent = (event) => {
  if (!event || typeof event !== 'object') return event;
  return {
    ...event,
    isAllDay: event.isAllDay ?? event.allDay ?? false,
  };
};
