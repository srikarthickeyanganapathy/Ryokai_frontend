/**
 * Canonical query keys for CalendarEvent entity in TanStack Query
 */
export const calendarEventQueryKeys = {
  all: ['calendarEvents'],
  range: (start, end) => ['calendarEvents', 'range', start, end],
};
