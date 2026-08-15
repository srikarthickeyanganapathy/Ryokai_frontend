export { TaskPanel } from './components/TaskPanel/TaskPanel';
export { TaskForm } from './features/manage-task/TaskForm';
export { TasksTable } from './components/TableView/TasksTable';
export { KanbanBoard } from './components/KanbanBoard/KanbanBoard';
// NebulaView removed from barrel — deep-import to avoid pulling three.js into entry chunk:
// import NebulaView from '@/task/components/Nebula/components/NebulaView';
export * from './entities/hooks/useTasks';
export * from './entities/model/types';
export * from './entities/model/normalizer';
export * from './entities/model/taskTabs';
