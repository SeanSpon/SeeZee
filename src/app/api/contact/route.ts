import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, renderEmailLayout } from '@/lib/email/send';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] || character));

// Simple in-memory rate limiting (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 5) {
    // Max 5 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Get IP address for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Server-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof body.email !== 'string' || !emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Limit input before storing and escape it when rendering HTML below.
    const sanitizedName = body.name.trim().slice(0, 100);
    const sanitizedEmail = body.email.trim().toLowerCase().slice(0, 255);
    const sanitizedMessage = body.message.trim().slice(0, 5000);

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        status: 'NEW',
        source: 'CONTACT_FORM',
      },
    });

    // Notify all admins about new lead
    const { createNewLeadNotification } = await import("@/lib/notifications");
    await createNewLeadNotification(
      lead.id,
      lead.name,
      lead.email,
      lead.company,
      "Contact Form"
    ).catch(err => console.error("Failed to create lead notification:", err));

    // Log LEAD_CREATED activity (direct prisma call — no auth in public route)
    prisma.activity.create({
      data: {
        type: 'LEAD_CREATED',
        title: `New lead from contact form`,
        description: `${sanitizedName} (${sanitizedEmail}) submitted the contact form.`,
        entityType: 'Lead',
        entityId: lead.id,
        createdBy: 'SYSTEM',
      },
    }).catch(err => console.error("Failed to log lead activity:", err));

    // Email the actual message to the team. The database lead remains available
    // in the CRM even if the mail provider is temporarily unavailable.
    const teamEmail = process.env.CONTACT_NOTIFICATION_EMAIL || 'contact@seezeestudios.com';
    // The default seezeestudios.com sender is not verified in Resend yet.
    // Use the existing sender domain documented in the project environment.
    const from = `SeeZee Studio <${process.env.RESEND_FROM_EMAIL || 'sean@see-zee.com'}>`;
    const teamResult = await sendEmail({
      from,
      to: teamEmail,
      replyTo: sanitizedEmail,
      subject: `New website inquiry from ${sanitizedName}`,
      text: `New contact form submission\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nLead ID: ${lead.id}\n\nMessage:\n${sanitizedMessage}`,
      html: renderEmailLayout(`
        <h2>New website inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}<br />
        <strong>Email:</strong> ${escapeHtml(sanitizedEmail)}<br />
        <strong>Lead ID:</strong> ${escapeHtml(lead.id)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap">${escapeHtml(sanitizedMessage)}</p>
      `),
    });
    if (!teamResult.success) {
      console.error('[Contact Form] Team email failed; lead retained in CRM:', lead.id, teamResult.error);
    }

    // Send a confirmation to the visitor when email is configured.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://seezeestudios.com';
    const emailHtml = renderEmailLayout(`
      <h2 style="margin: 0 0 16px; font-size: 24px; color: #111;">We got your message!</h2>
      <p>Hi ${escapeHtml(sanitizedName)},</p>
      <p>Thanks for reaching out to SeeZee Studio. We&rsquo;ve received your message and a member of our team will get back to you within 24 hours.</p>
      <p>In the meantime, you can create a free account to track your project, view updates, and communicate with our team — all in one place.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/signup" class="button">Create Your Account</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">Already have an account? <a href="${appUrl}/login?returnUrl=/client" style="color: #dc2626; text-decoration: none;">Log in to your dashboard</a></p>
    `);

    const confirmationResult = await sendEmail({
      from,
      to: sanitizedEmail,
      subject: "We got your message — SeeZee Studios",
      html: emailHtml,
    });
    if (!confirmationResult.success) {
      console.error('[Contact Form] Visitor confirmation failed:', lead.id, confirmationResult.error);
    }

    return NextResponse.json({
      success: true,
      referenceId: lead.id,
      teamNotified: teamResult.success,
      confirmationSent: confirmationResult.success,
      message: teamResult.success
        ? 'Thank you for contacting us! We\'ll get back to you soon.'
        : 'Your message was saved, but our email notification is delayed. Please contact us directly if your request is urgent.'
    });

  } catch (error) {
    console.error('[Contact Form Error]', error);
    return NextResponse.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    );
  }
}
