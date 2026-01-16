/**
 * Drip Campaign Email Sender
 * Background job that sends emails for due drip campaign enrollments
 * 
 * To run this job, set up a cron job or use Vercel Cron:
 * - Add to vercel.json: { "crons": [{ "path": "/api/cron/drip-campaigns", "schedule": "0 * * * *" }] }
 * - Or run manually: POST /api/cron/drip-campaigns
 */

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendResult {
  enrollmentId: string;
  success: boolean;
  error?: string;
}

export async function processDripCampaigns(): Promise<{
  success: boolean;
  processed: number;
  sent: number;
  errors: number;
  results: SendResult[];
}> {
  const now = new Date();
  const results: SendResult[] = [];
  let processed = 0;
  let sent = 0;
  let errors = 0;

  try {
    // Find all enrollments that are due for sending
    const dueEnrollments = await prisma.dripEnrollment.findMany({
      where: {
        nextEmailAt: {
          lte: now,
        },
        completed: false,
        unsubscribed: false,
        paused: false,
      },
      include: {
        campaign: {
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
              include: {
                template: true,
              },
            },
          },
        },
        prospect: true,
      },
    });

    console.log(`[Drip Campaigns] Found ${dueEnrollments.length} due enrollments`);

    for (const enrollment of dueEnrollments) {
      processed++;

      try {
        // Get the current step
        const step = enrollment.campaign.steps.find(
          (s) => s.stepNumber === enrollment.currentStep
        );

        if (!step) {
          // No more steps - mark as completed
          await prisma.dripEnrollment.update({
            where: { id: enrollment.id },
            data: {
              completed: true,
              completedAt: now,
              nextEmailAt: null,
            },
          });
          
          results.push({
            enrollmentId: enrollment.id,
            success: true,
          });
          continue;
        }

        // Check if we should skip this step
        if (step.skipIfReplied && enrollment.repliedAt) {
          // Skip to next step
          const nextStep = enrollment.campaign.steps.find(
            (s) => s.stepNumber === enrollment.currentStep + 1
          );

          if (!nextStep) {
            // No more steps - complete
            await prisma.dripEnrollment.update({
              where: { id: enrollment.id },
              data: {
                completed: true,
                completedAt: now,
                nextEmailAt: null,
              },
            });
          } else {
            // Schedule next step
            const nextEmailAt = new Date();
            nextEmailAt.setDate(nextEmailAt.getDate() + nextStep.delayDays);
            nextEmailAt.setHours(nextEmailAt.getHours() + nextStep.delayHours);

            await prisma.dripEnrollment.update({
              where: { id: enrollment.id },
              data: {
                currentStep: enrollment.currentStep + 1,
                nextEmailAt,
              },
            });
          }

          results.push({
            enrollmentId: enrollment.id,
            success: true,
          });
          continue;
        }

        // Send the email
        const template = step.template;
        
        // Replace variables in template
        const variables: Record<string, string> = {
          prospectName: enrollment.prospect.name,
          company: enrollment.prospect.company || enrollment.prospect.name,
          email: enrollment.prospect.email,
          phone: enrollment.prospect.phone || "",
          city: enrollment.prospect.city || "",
          state: enrollment.prospect.state || "",
          category: enrollment.prospect.category || "",
          websiteUrl: enrollment.prospect.websiteUrl || "",
          leadScore: enrollment.prospect.leadScore.toString(),
          yourName: "Sean (SeeZee)",
          yourCompany: "SeeZee Studio",
          yourPhone: "(502) 384-7439",
        };

        let subject = template.subject;
        let htmlContent = template.htmlContent;
        
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
          subject = subject.replace(regex, value);
          htmlContent = htmlContent.replace(regex, value);
        });

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: "SeeZee Studio <outreach@seezeestudios.com>",
          to: enrollment.prospect.email,
          subject,
          html: htmlContent,
        });

        if (emailResult.error) {
          throw new Error(emailResult.error.message);
        }

        // Create sent email record
        await prisma.sentEmail.create({
          data: {
            prospectId: enrollment.prospect.id,
            from: "outreach@seezeestudios.com",
            to: enrollment.prospect.email,
            subject,
            body: htmlContent,
            sentAt: now,
            status: "SENT",
            resendId: emailResult.data?.id || null,
          },
        });

        // Update step analytics
        await prisma.dripCampaignStep.update({
          where: { id: step.id },
          data: {
            sent: { increment: 1 },
          },
        });

        // Update enrollment
        const nextStep = enrollment.campaign.steps.find(
          (s) => s.stepNumber === enrollment.currentStep + 1
        );

        const updateData: any = {
          lastEmailAt: now,
          currentStep: enrollment.currentStep + 1,
        };

        if (nextStep) {
          // Schedule next email
          const nextEmailAt = new Date();
          nextEmailAt.setDate(nextEmailAt.getDate() + nextStep.delayDays);
          nextEmailAt.setHours(nextEmailAt.getHours() + nextStep.delayHours);
          updateData.nextEmailAt = nextEmailAt;
        } else {
          // No more steps - mark as completed
          updateData.completed = true;
          updateData.completedAt = now;
          updateData.nextEmailAt = null;
        }

        await prisma.dripEnrollment.update({
          where: { id: enrollment.id },
          data: updateData,
        });

        sent++;
        results.push({
          enrollmentId: enrollment.id,
          success: true,
        });

        console.log(`[Drip Campaigns] Sent email to ${enrollment.prospect.email} (Enrollment: ${enrollment.id}, Step: ${step.stepNumber + 1})`);
      } catch (error: any) {
        errors++;
        console.error(`[Drip Campaigns] Error processing enrollment ${enrollment.id}:`, error);
        
        results.push({
          enrollmentId: enrollment.id,
          success: false,
          error: error.message,
        });
      }
    }

    console.log(`[Drip Campaigns] Processed: ${processed}, Sent: ${sent}, Errors: ${errors}`);

    return {
      success: true,
      processed,
      sent,
      errors,
      results,
    };
  } catch (error: any) {
    console.error("[Drip Campaigns] Fatal error:", error);
    return {
      success: false,
      processed,
      sent,
      errors,
      results,
    };
  }
}

/**
 * Enroll a prospect in a drip campaign
 */
export async function enrollProspect(
  prospectId: string,
  campaignId: string
): Promise<{ success: boolean; enrollment?: any; error?: string }> {
  try {
    // Check if already enrolled
    const existing = await prisma.dripEnrollment.findUnique({
      where: {
        campaignId_prospectId: {
          campaignId,
          prospectId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Prospect is already enrolled in this campaign",
      };
    }

    // Get campaign and first step
    const campaign = await prisma.dripCampaign.findUnique({
      where: { id: campaignId },
      include: {
        steps: {
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    if (!campaign) {
      return {
        success: false,
        error: "Campaign not found",
      };
    }

    if (!campaign.active) {
      return {
        success: false,
        error: "Campaign is not active",
      };
    }

    if (campaign.steps.length === 0) {
      return {
        success: false,
        error: "Campaign has no steps",
      };
    }

    const firstStep = campaign.steps[0];
    
    // Schedule first email (immediate if first step has 0 delay, otherwise after delay)
    const nextEmailAt = new Date();
    if (firstStep.delayDays > 0 || firstStep.delayHours > 0) {
      nextEmailAt.setDate(nextEmailAt.getDate() + firstStep.delayDays);
      nextEmailAt.setHours(nextEmailAt.getHours() + firstStep.delayHours);
    }

    const enrollment = await prisma.dripEnrollment.create({
      data: {
        campaignId,
        prospectId,
        currentStep: 0,
        nextEmailAt,
      },
    });

    return {
      success: true,
      enrollment,
    };
  } catch (error: any) {
    console.error("Error enrolling prospect:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
