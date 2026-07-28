/**
 * ExecutionEngine evaluates a set of tasks and determines their execution state
 * dynamically. This separates the prioritization rules from the UI component.
 */
export class ExecutionEngine {
  static evaluateTasks(tasks) {
    if (!tasks) return [];
    
    // States: NOW, NEXT, BLOCKED, WAITING, SCHEDULED, BACKLOG
    return tasks.map(task => {
      let state = 'BACKLOG';
      
      if (task.status === 'In Progress') {
        state = 'NOW';
      } else if (task.status === 'Blocked') {
        state = 'BLOCKED';
      } else if (task.status === 'Waiting') {
        state = 'WAITING';
      } else if (task.priority === 'URGENT' || task.priority === 'HIGH') {
        state = 'NEXT';
      } else if (task.dueDate) {
        state = 'SCHEDULED';
      }

      return {
        ...task,
        executionState: state
      };
    });
  }

  static groupTasksByState(evaluatedTasks) {
    const groups = {
      NOW: [],
      NEXT: [],
      BLOCKED: [],
      WAITING: [],
      SCHEDULED: [],
      BACKLOG: []
    };

    evaluatedTasks.forEach(t => {
      if (groups[t.executionState]) {
        groups[t.executionState].push(t);
      }
    });

    return groups;
  }
}
