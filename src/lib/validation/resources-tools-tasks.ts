import { z } from "zod";

// Visibility enum
export const visibilityEnum = z.enum(["INTERNAL", "PUBLIC", "CLIENT"]);

// Resource schemas
export const createResourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Valid URL is required"),
  description: z.string().optional(),
  visibility: visibilityEnum.default("INTERNAL"),
  tags: z.array(z.string()).default([]),
});

export const updateResourceSchema = createResourceSchema
  .partial()
  .extend({ id: z.string().min(1) });

// Tool schemas
export const createToolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  url: z.string().url("Valid URL is required"),
  description: z.string().optional(),
  visibility: visibilityEnum.default("INTERNAL"),
  tags: z.array(z.string()).default([]),
  icon: z.string().optional(),
});

export const updateToolSchema = createToolSchema
  .partial()
  .extend({ id: z.string().min(1) });

// Task assignment schemas
export const assignTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  projectId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  // Role-based assignment (assign to role group)
  assignedToRole: z.enum(["FRONTEND", "BACKEND", "OUTREACH"]).optional(),
  // Individual assignment (backward compatibility)
  userIds: z.array(z.string()).optional(),
  // Payout amount for the task
  payoutAmount: z.number().positive().optional(),
  templateId: z.string().optional(), // For saving/loading templates
  tags: z.array(z.string()).optional(), // Task tags for organization
  estimatedHours: z.number().positive().optional(), // Estimated time to complete
  dependencies: z.array(z.string()).optional(), // Task IDs this task depends on
  isRecurring: z.boolean().optional().default(false),
  recurringPattern: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
}).refine(
  (data) => data.assignedToRole || (data.userIds && data.userIds.length > 0),
  {
    message: "Either assignedToRole or userIds must be provided",
  }
);

// Types
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateToolInput = z.infer<typeof createToolSchema>;
export type UpdateToolInput = z.infer<typeof updateToolSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
