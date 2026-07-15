import api from '@/lib/api';

/**
 * FIX: backend DROPPED task_templates in migration V30__drop_task_templates.sql
 * and the TEMPLATE_MANAGE permission was deleted in V29. The old code here
 * called /api/task-templates endpoints that no longer exist — every call
 * would return 404 Not Found.
 *
 * These functions are stubbed out with clear errors. If your UI still imports
 * these, either (a) remove the TaskTemplateManagerModal from your component
 * tree, or (b) re-implement templates as a frontend-only feature using
 * localStorage.
 */

const TEMPLATE_REMOVED_MSG =
  'Task templates were removed from the backend in V30. ' +
  'Use localStorage for client-side templates or remove the TaskTemplateManagerModal.';

export const getTemplates = async () => {
  console.warn('[taskTemplate.api] ' + TEMPLATE_REMOVED_MSG);
  // Return empty list so UI doesn't crash — the modal will show "no templates"
  return [];
};

export const createTemplate = async (_templateData) => {
  throw new Error(TEMPLATE_REMOVED_MSG);
};

export const updateTemplate = async (_id, _templateData) => {
  throw new Error(TEMPLATE_REMOVED_MSG);
};

export const deleteTemplate = async (_id) => {
  throw new Error(TEMPLATE_REMOVED_MSG);
};
