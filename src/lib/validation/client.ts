import { z } from "zod";

export const clientMessageCreate = z.object({
  subject: z.string().min(1).optional(),
  projectId: z.string().optional(),
  message: z.string().min(1),
});

export const clientRequestCreate = z.object({
  type: z.enum(["FEATURE", "CHANGE", "SUPPORT"]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10000),
  projectId: z.string().optional(),
});

export const clientSettingsUpdate = z.object({
  name: z.string().min(1),
  timezone: z.string().min(1),
});
