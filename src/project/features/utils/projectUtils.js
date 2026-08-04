/**
 * Calculate project health score (0 - 100) based on progress, status, tasks, and deadlines.
 */
export const calculateHealthScore = (project) => {
  if (!project) return 100;
  if (project.status === 'COMPLETED' || Number(project.progress) >= 100) return 100;

  let score = 80; // Base healthy score for active projects
  const progress = Number(project.progress) || 0;
  const tasksTotal = Number(project.tasksTotal) || 0;
  const tasksCompleted = Number(project.tasksCompleted) || 0;

  if (tasksTotal > 0 && tasksCompleted / tasksTotal >= progress / 100) {
    score += 5;
  }

  if (project.dueDate) {
    const dueDate = new Date(project.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      score -= 35; // Overdue penalty
    } else if (diffDays <= 3 && progress < 80) {
      score -= 20; // Due very soon with low progress
    } else if (diffDays <= 7 && progress < 50) {
      score -= 10; // Due this week with low progress
    }
  }

  if (project.status === 'OFF_TRACK') score -= 25;
  if (project.status === 'AT_RISK') score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getHealthStatus = (score) => {
  if (score >= 85) return { label: 'Excellent', tone: 'success' };
  if (score >= 70) return { label: 'Healthy', tone: 'accent' };
  if (score >= 50) return { label: 'At Risk', tone: 'warning' };
  return { label: 'Critical', tone: 'danger' };
};

export const formatRelativeDate = (isoString) => {
  if (!isoString) return 'No due date';
  const dueDate = new Date(isoString);
  const now = new Date();
  const diffTime = dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
  if (diffDays === 0) return 'Due Today';
  if (diffDays === 1) return 'Due Tomorrow';
  if (diffDays <= 7) return `${diffDays} days left`;
  
  return dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const getPortfolioMetrics = (projects) => {
  if (!projects || projects.length === 0) {
    return { total: 0, active: 0, completed: 0, atRisk: 0, overallProgress: 0, endingThisWeek: 0, overdue: 0 };
  }

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return projects.reduce((acc, p) => {
    acc.total++;
    if (p.status === 'ACTIVE' || p.status === 'IN_PROGRESS' || (!p.status && p.status !== 'COMPLETED')) acc.active++;
    if (p.status === 'COMPLETED') acc.completed++;
    
    const health = calculateHealthScore(p);
    if (health < 60 && p.status !== 'COMPLETED') acc.atRisk++;
    
    if (p.dueDate) {
      const due = new Date(p.dueDate);
      if (due < now && p.status !== 'COMPLETED') acc.overdue++;
      if (due >= now && due <= weekFromNow && p.status !== 'COMPLETED') acc.endingThisWeek++;
    }

    acc.overallProgress += (Number(p.progress) || 0);
    return acc;
  }, { total: 0, active: 0, completed: 0, atRisk: 0, overallProgress: 0, endingThisWeek: 0, overdue: 0 });
};

export const getTaskAnalytics = (tasks) => {
  if (!tasks || tasks.length === 0) return { total: 0, done: 0, inProgress: 0, todo: 0, completionRate: 0 };
  
  const analytics = tasks.reduce((acc, task) => {
    acc.total++;
    const status = (task.status || '').toUpperCase();
    if (status === 'DONE' || status === 'COMPLETED') acc.done++;
    else if (status === 'IN_PROGRESS' || status === 'REVIEW') acc.inProgress++;
    else acc.todo++;
    return acc;
  }, { total: 0, done: 0, inProgress: 0, todo: 0 });

  analytics.completionRate = analytics.total > 0 ? Math.round((analytics.done / analytics.total) * 100) : 0;
  return analytics;
};

export const getTeamContributions = (tasks) => {
  if (!tasks || tasks.length === 0) return [];
  
  const contributions = tasks.reduce((acc, task) => {
    const user = task.assignedTo || task.assigneeUsername || 'Unassigned';
    if (!acc[user]) acc[user] = { name: user, tasks: 0 };
    acc[user].tasks++;
    return acc;
  }, {});

  const totalTasks = tasks.length;
  return Object.values(contributions).map(c => ({
    ...c,
    percentage: Math.round((c.tasks / totalTasks) * 100)
  })).sort((a, b) => b.tasks - a.tasks);
};
