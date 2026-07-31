export const WIDGET_REGISTRY = [
  // --- HEADER WIDGETS ---
  {
    id: 'daily_brief',
    component: 'DailyBriefWidget',
    placement: 'header',
    order: 0,
    workspaceModes: ['PERSONAL'],
    requiredPermissions: [],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  },
  {
    id: 'signal_strip',
    component: 'SignalStrip',
    placement: 'header',
    order: 1,
    workspaceModes: ['PERSONAL', 'CREWS', 'ORG'],
    requiredPermissions: [],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  },

  // --- PRIMARY WIDGETS ---
  {
    id: 'execution_queue',
    component: 'ExecutionQueue',
    placement: 'primary',
    order: 1,
    workspaceModes: ['PERSONAL', 'CREWS'],
    requiredPermissions: [],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  },
  {
    id: 'workload_brief',
    component: 'WorkloadBrief',
    placement: 'primary',
    order: 1,
    workspaceModes: ['ORG'],
    requiredPermissions: ['DASHBOARD_VIEW'],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  },
  {
    id: 'focus_panel',
    component: 'FocusPanel',
    placement: 'primary',
    order: 2,
    workspaceModes: ['PERSONAL', 'CREWS', 'ORG'],
    requiredPermissions: [],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  },

  // --- CONTEXT WIDGETS ---
  {
    id: 'personal_context_rail',
    component: 'PersonalContextRail',
    placement: 'context',
    order: 1,
    workspaceModes: ['PERSONAL'],
    requiredPermissions: [],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  },
  {
    id: 'crew_context_rail',
    component: 'CrewContextRail',
    placement: 'context',
    order: 1,
    workspaceModes: ['CREWS'],
    requiredPermissions: [],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  },
  {
    id: 'org_context_rail',
    component: 'OrgContextRail',
    placement: 'context',
    order: 1,
    workspaceModes: ['ORG'],
    requiredPermissions: [],
    requiredCapabilities: [],
    lazy: false,
    visible: true,
    featureFlag: null
  }
];
