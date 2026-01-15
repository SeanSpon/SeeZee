import { z } from "zod";
import { TrainingType, Visibility, AudienceType, CompletionStatus } from "@prisma/client";

/**
 * Training schemas
 */
export const createTrainingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  type: z.nativeEnum(TrainingType),
  description: z.string().max(2000, "Description too long").default(""),
  visibility: z.nativeEnum(Visibility).default("INTERNAL"),
  url: z.string().url("Must be a valid URL").optional().nullable(),
  fileKey: z.string().optional().nullable(),
  tags: z
    .array(z.string())
    .default([])
    .transform((tags) => {
      // Normalize tags: lowercase, trim, unique
      const normalized = tags
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0);
      return [...new Set(normalized)];
    }),
});

export const updateTrainingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.nativeEnum(TrainingType).optional(),
  description: z.string().max(2000).optional().nullable(),
  visibility: z.nativeEnum(Visibility).optional(),
  url: z.string().url().optional().nullable(),
  fileKey: z.string().optional().nullable(),
  tags: z
    .array(z.string())
    .optional()
    .transform((tags) => {
      if (!tags) return undefined;
      const normalized = tags
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0);
      return [...new Set(normalized)];
    }),
});

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;

/**
 * Resource schemas
 */
export const createResourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  url: z.string().url("Must be a valid URL"),
  visibility: z.nativeEnum(Visibility),
  tags: z
    .array(z.string())
    .optional()
    .transform((tags) => {
      if (!tags) return [];
      const normalized = tags
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0);
      return [...new Set(normalized)];
    }),
});

export const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  url: z.string().url().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  tags: z
    .array(z.string())
    .optional()
    .transform((tags) => {
      if (!tags) return undefined;
      const normalized = tags
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0);
      return [...new Set(normalized)];
    }),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

/**
 * Tool schemas
 */
export const createToolSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  category: z.string().min(1, "Category is required").max(100),
  description: z.string().max(2000, "Description too long").optional(),
  url: z.string().url("Must be a valid URL"),
  visibility: z.nativeEnum(Visibility),
  tags: z
    .array(z.string())
    .optional()
    .transform((tags) => {
      if (!tags) return [];
      const normalized = tags
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0);
      return [...new Set(normalized)];
    }),
});

export const updateToolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  url: z.string().url().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  tags: z
    .array(z.string())
    .optional()
    .transform((tags) => {
      if (!tags) return undefined;
      const normalized = tags
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0);
      return [...new Set(normalized)];
    }),
});

export type CreateToolInput = z.infer<typeof createToolSchema>;
export type UpdateToolInput = z.infer<typeof updateToolSchema>;

/**
 * Assignment schemas
 */
const audienceSchema = z.object({
  type: z.nativeEnum(AudienceType),
  id: z.string().optional(), // userId for USER type, teamId for TEAM type
  role: z.string().optional(), // role for ROLE type
});

export const bulkAssignSchema = z.object({
  trainingId: z.string().uuid("Invalid training ID"),
  audiences: z.array(audienceSchema).min(1, "At least one audience required"),
  dueAt: z.string().datetime().optional(),
});

export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;

/**
 * Completion schemas
 */
export const updateCompletionSchema = z.object({
  completionId: z.string().uuid().optional(),
  assignmentId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.nativeEnum(CompletionStatus),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateCompletionInput = z.infer<typeof updateCompletionSchema>;

/**
 * Query params schemas
 */
export const trainingQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  type: z.nativeEnum(TrainingType).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const resourceQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const toolQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  category: z.string().optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type TrainingQuery = z.infer<typeof trainingQuerySchema>;
export type ResourceQuery = z.infer<typeof resourceQuerySchema>;
export type ToolQuery = z.infer<typeof toolQuerySchema>;
