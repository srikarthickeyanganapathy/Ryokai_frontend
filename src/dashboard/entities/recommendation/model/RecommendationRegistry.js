export class RecommendationRegistry {
  constructor() {
    this.providers = [];
  }

  registerProvider(provider) {
    this.providers.push(provider);
  }

  async getRecommendations(context) {
    const promises = this.providers.map(p => p.getRecommendations(context));
    const results = await Promise.allSettled(promises);
    
    let allRecommendations = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allRecommendations = allRecommendations.concat(result.value);
      }
    }

    // Sort by priority (URGENT -> HIGH -> NORMAL -> LOW)
    const priorityWeights = {
      'URGENT': 4,
      'HIGH': 3,
      'NORMAL': 2,
      'LOW': 1
    };

    allRecommendations.sort((a, b) => {
      const wA = priorityWeights[a.priority] || 0;
      const wB = priorityWeights[b.priority] || 0;
      return wB - wA;
    });

    return allRecommendations;
  }
}

// Singleton registry instance
export const recommendationRegistry = new RecommendationRegistry();

// Example Task Provider (in real app, this might be separate)
class TaskRecommendationProvider {
  getRecommendations(context) {
    const { tasks } = context;
    if (!tasks || tasks.length === 0) return [];
    
    const pending = tasks.filter(t => t.status !== 'Done' && t.status !== 'Canceled');
    if (pending.length === 0) return [];
    
    // Simplistic example: return top priority task
    const topTask = pending.sort((a, b) => {
      if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
      return 0;
    })[0];
    
    return [{
      id: `task-${topTask.id}`,
      type: 'TASK',
      title: topTask.title,
      description: topTask.timeEstimateMinutes ? `${topTask.timeEstimateMinutes}m estimate` : 'No estimate',
      priority: topTask.priority,
      action: 'Complete',
      icon: 'zap',
      metadata: { taskId: topTask.id }
    }];
  }
}

recommendationRegistry.registerProvider(new TaskRecommendationProvider());
