/**
 * Workspace Event Bus
 * A simple pub/sub event bus for workspace activities.
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {any} data - Event payload
   */
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

export const workspaceEventBus = new EventBus();

// Standard Workspace Events
export const WORKSPACE_EVENTS = {
  MEMBER_JOINED: 'MEMBER_JOINED',
  ROLE_UPDATED: 'ROLE_UPDATED',
  GOAL_EDITED: 'GOAL_EDITED',
  EXIT_REQUEST_SUBMITTED: 'EXIT_REQUEST_SUBMITTED',
  ANNOUNCEMENT_POSTED: 'ANNOUNCEMENT_POSTED',
};

/**
 * Helper to merge different entity lists into a single chronological timeline.
 * Each entity type might have different date fields, so we normalize them.
 */
export function getMergedTimelineEvents(announcements = [], leaveRequests = [], goals = [], members = []) {
  const events = [];

  announcements.forEach(a => {
    events.push({
      ...a,
      _timelineType: 'announcement',
      _timelineDate: new Date(a.createdAt || a.date).getTime(),
    });
  });

  leaveRequests.forEach(lr => {
    events.push({
      ...lr,
      _timelineType: 'leave_request',
      _timelineDate: new Date(lr.submittedAt || lr.createdAt || lr.date).getTime(),
    });
  });

  goals.forEach(g => {
    events.push({
      ...g,
      _timelineType: 'goal',
      _timelineDate: new Date(g.updatedAt || g.createdAt || g.date).getTime(),
    });
  });

  members.forEach(m => {
    events.push({
      ...m,
      _timelineType: 'member_joined',
      _timelineDate: new Date(m.joinedAt || m.createdAt || m.date).getTime(),
    });
  });

  // Sort descending (newest first)
  return events.sort((a, b) => b._timelineDate - a._timelineDate);
}
