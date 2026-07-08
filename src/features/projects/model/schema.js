import { z } from 'zod'

/** Project schema aligned with backend ProjectResponseDTO */
export const ProjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  organizationId: z.number().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  teamId: z.number().nullable().optional(),
  teamName: z.string().nullable().optional(),
  createdBy: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  dueDate: z.string().nullable().optional(),
  progress: z.number().default(0),
  tasksTotal: z.number().default(0),
  tasksCompleted: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const CreateProjectSchema = ProjectSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const UpdateProjectSchema = ProjectSchema.partial()
