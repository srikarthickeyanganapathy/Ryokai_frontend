import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { useOnboardingStatus, ONBOARDING_STATUS } from '../hooks/useOnboarding';

const SEEN_KEY = 'ryokai.spotlightTour.seen.v1';

const readSeen = () => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') } catch { return {} }
}
const markSeen = (key) => {
  try {
    const seen = readSeen()
    seen[key] = Date.now()
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch { }
}

const TOUR_CONFIGS = {
  dashboard: {
    match: (p) => p === '/app' || p === '/app/',
    steps: [
      { target: 'dashboard-stats', title: 'Mission Control', text: 'This is your Mission Control. It shows your active tasks, deadlines, and quick actions.' },
      { target: 'dashboard-quick-actions', title: 'Quick Actions', text: 'Use these quick actions to create tasks or start a focus session.' },
      { target: 'sidebar-nav', title: 'Navigation', text: 'Navigate between Tasks, Projects, Calendar, and more from the sidebar.' }
    ]
  },
  tasks: {
    match: (p) => p === '/app/tasks',
    steps: [
      { target: 'tasks-new-btn', title: 'Create Tasks', text: 'Click here to create your first task. Give it a title, priority, and due date.' },
      { target: 'tasks-view-toggle', title: 'Multiple Views', text: 'Switch between List, Table, and Kanban views to organize your tasks differently.' },
      { target: 'tasks-first-card', title: 'Task Details', text: 'Click any task to see its details, checklist, and progress.' },
      { target: 'tasks-filter-bar', title: 'Find Anything', text: 'Filter and search your tasks to find what you need.' }
    ]
  },
  projects: {
    match: (p) => p === '/app/projects',
    steps: [
      { target: 'projects-new-btn', title: 'Create Projects', text: 'Create a project to group related tasks together.' },
      { target: 'projects-first-card', title: 'Project Details', text: 'Click a project to see its tasks, progress, and team.' },
      { target: 'projects-share-info', title: 'Collaborate', text: 'You can share personal projects with your crew using the Share button on any project.' }
    ]
  },
  calendar: {
    match: (p) => p === '/app/calendar',
    steps: [
      { target: 'calendar-grid', title: 'Your Schedule', text: 'Your task deadlines and events appear here.' },
      { target: 'calendar-create-area', title: 'Create Events', text: 'Click any day to create a new event.' },
      { target: 'calendar-view-toggle', title: 'Change Views', text: 'Switch between Month and Week views.' }
    ]
  },
  analytics: {
    match: (p) => p.startsWith('/app/analytics'),
    steps: [
      { target: 'analytics-stats', title: 'Quick Stats', text: 'Track your completion rate and workload at a glance.' },
      { target: 'analytics-charts', title: 'Trends', text: 'See trends in your task completion over time.' }
    ]
  },
  crews: {
    match: (p) => p.startsWith('/app/crews') && p.split('/').length <= 3,
    steps: [
      { target: 'crews-create-btn', title: 'Form a Crew', text: 'Create a crew to collaborate with others.' },
      { target: 'crews-invite-info', title: 'Work Together', text: 'Invite members and share projects to work together.' }
    ]
  },
  organizations: {
    match: (p) => p.startsWith('/app/organizations'),
    steps: [
      { target: 'org-overview', title: 'Organization Structure', text: 'Organizations add structure with roles, teams, and permissions.' },
      { target: 'org-invite', title: 'Grow your Team', text: 'Invite members and assign roles to organize your team.' }
    ]
  }
};

export function PageCoach() {
  const location = useLocation();
  const { data } = useOnboardingStatus();
  
  const status = data?.status;
  const onboarded = status === ONBOARDING_STATUS.COMPLETED || status === ONBOARDING_STATUS.SKIPPED;

  const [activeTour, setActiveTour] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!onboarded) return;
    const tourKey = Object.keys(TOUR_CONFIGS).find(k => TOUR_CONFIGS[k].match(location.pathname));
    if (!tourKey) { setActiveTour(null); return; }
    
    const seen = readSeen();
    if (seen[tourKey]) { setActiveTour(null); return; }
    
    const timer = setTimeout(() => {
      setActiveTour(tourKey);
      setCurrentStepIndex(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, onboarded]);

  const updateRect = useCallback(() => {
    if (!activeTour) return;
    const steps = TOUR_CONFIGS[activeTour].steps;
    const step = steps[currentStepIndex];
    if (!step) return;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }, 300);
    } else {
      setTargetRect(null);
    }
  }, [activeTour, currentStepIndex]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  if (!activeTour) return null;

  const steps = TOUR_CONFIGS[activeTour].steps;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      dismiss();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const dismiss = () => {
    markSeen(activeTour);
    setActiveTour(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/50 transition-all duration-300 pointer-events-none"
        style={targetRect ? {
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${targetRect.left - 8}px 100%, 
            ${targetRect.left - 8}px ${targetRect.top - 8}px, 
            ${targetRect.left + targetRect.width + 8}px ${targetRect.top - 8}px, 
            ${targetRect.left + targetRect.width + 8}px ${targetRect.top + targetRect.height + 8}px, 
            ${targetRect.left - 8}px ${targetRect.top + targetRect.height + 8}px, 
            ${targetRect.left - 8}px 100%, 
            100% 100%, 100% 0%
          )`
        } : { clipPath: 'none' }}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl rounded-xl w-[320px] p-4 pointer-events-auto"
          style={
            targetRect ? {
              top: targetRect.top + targetRect.height + 20 > window.innerHeight - 200 
                ? targetRect.top - 180 
                : targetRect.top + targetRect.height + 16,
              left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 340))
            } : {
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
            }
          }
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-[var(--accent)]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <button onClick={dismiss} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <h3 className="text-[14px] font-bold text-[var(--text-primary)] leading-snug">
                {currentStep.title}
              </h3>
              <p className="mt-1 text-[12px] text-[var(--text-secondary)] leading-relaxed">
                {currentStep.text}
              </p>
              
              <div className="mt-4 flex items-center justify-between">
                <button 
                  onClick={dismiss}
                  className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Skip Tour
                </button>
                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button 
                      onClick={handlePrev}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3 inline-block mr-1" /> Back
                    </button>
                  )}
                  <button 
                    onClick={handleNext}
                    className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm flex items-center gap-1"
                  >
                    {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} 
                    {currentStepIndex < steps.length - 1 && <ArrowRight className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}

