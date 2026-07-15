import { z } from 'zod'

/**
 * Task schema aligned with backend TaskRequestDTO + TaskPriority enum.
 *
 * FIX: backend TaskPriority enum is { LOW, MEDIUM, HIGH, URGENT }.
 * The old schema listed 'NORMAL' and 'NONE' which don't exist in the backend
 * — any task created with those values would fail Jackson deserialization
 * with a 400 Bad Request. Replaced with the correct enum values.
 */
export const TaskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigneeUsername: z.string().min(1, 'Assignee is required'),
  creatorUsername: z.string().optional(),
  // FIX: backend enum is LOW, MEDIUM, HIGH, URGENT (no NORMAL, no NONE)
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  dueDate: z.string().nullable().optional(),
  tags: z.string().optional(),
  isPersonal: z.boolean().default(false),
  teamId: z.number().nullable().optional(),
  projectId: z.number().nullable().optional(),
  crewId: z.number().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const CreateTaskSchema = TaskSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateTaskSchema = TaskSchema.partial()
