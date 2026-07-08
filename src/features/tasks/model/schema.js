import { z } from 'zod'

/** Task schema aligned with backend TaskRequestDTO */
export const TaskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigneeUsername: z.string().min(1, 'Assignee is required'),
  creatorUsername: z.string().optional(),
  priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW', 'NONE']).default('NORMAL'),
  dueDate: z.string().nullable().optional(),
  tags: z.string().optional(),
  isPersonal: z.boolean().default(false),
  teamId: z.number().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const CreateTaskSchema = TaskSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateTaskSchema = TaskSchema.partial()
