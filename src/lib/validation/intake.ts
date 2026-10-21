import { z } from "zod";
const text = (max: number) => z.string().trim().max(max);
export const intakeSchema = z
  .object({
    submissionId: z.string().uuid().optional(),
    serviceType: z.enum([
      "BUSINESS_WEBSITE",
      "NONPROFIT_WEBSITE",
      "PERSONAL_WEBSITE",
      "MAINTENANCE_PLAN",
    ]),
    name: text(100).min(1),
    email: text(254)
      .email()
      .transform((value) => value.toLowerCase()),
    projectGoals: text(10000).min(1),
    phone: text(50).optional(),
    company: text(200).optional(),
    budget: text(100).optional(),
    timeline: text(200).optional(),
    nonprofitStatus: text(100).optional(),
    nonprofitEIN: text(100).optional(),
    maintenanceNeeds: z.array(text(200)).max(30).optional(),
    maintenanceTier: text(100).optional(),
    urgency: text(100).optional(),
    websiteUrl: text(2048).optional(),
    currentWebsite: text(2048).optional(),
    websitePlatform: text(100).optional(),
    hasAccessCredentials: text(100).optional(),
    estimatedHours: z
      .union([z.number(), z.string().trim()])
      .optional()
      .transform((value) =>
        value === "" || value == null ? null : Number(value),
      )
      .refine(
        (value) =>
          value === null ||
          (Number.isFinite(value) && value > 0 && value <= 10000),
        "Invalid estimated hours",
      ),
    attachments: z
      .array(
        z
          .string()
          .url()
          .max(2048)
          .refine(
            (value) => new URL(value).protocol === "https:",
            "Attachments must use HTTPS",
          ),
      )
      .max(10)
      .default([]),
    additionalNotes: text(10000).optional(),
    specialRequirements: text(10000).optional(),
    organizationType: text(200).optional(),
    role: text(200).optional(),
    bestTimeToCall: text(200).optional(),
    selectedTier: text(100).optional(),
    pricing: text(200).optional(),
    pricingComfort: text(200).optional(),
    importantFeatures: z.array(text(200)).max(50).optional(),
    otherFeature: text(2000).optional(),
    contentReadiness: text(200).optional(),
    tier: text(100).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.websiteUrl && !/^https?:\/\//i.test(value.websiteUrl)) {
      // Forms also accept bare domains; normalize downstream rather than discard them.
      if (!/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value.websiteUrl))
        ctx.addIssue({
          code: "custom",
          path: ["websiteUrl"],
          message: "Enter a valid website",
        });
    }
  });
export type IntakeInput = z.infer<typeof intakeSchema>;
