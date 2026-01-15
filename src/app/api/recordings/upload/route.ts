import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin roles can create transcripts
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const adminRoles = ["CEO", "CFO"];
    if (!adminRoles.includes(user?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, transcript, projectId } = body;

    if (!title || !transcript) {
      return NextResponse.json(
        { error: "Title and transcript are required" },
        { status: 400 }
      );
    }

    // Validate transcript has content
    if (transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "Transcript must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Validate projectId if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    // Create recording with manual transcript
    const recording = await prisma.recording.create({
      data: {
        title,
        transcript,
        status: "TRANSCRIBED", // Already has transcript
        uploadedById: session.user.id,
        projectId: projectId || null,
        transcribedAt: new Date(),
        // Required fields for Recording model (manual transcript, no file)
        filename: `transcript-${Date.now()}.txt`,
        filePath: "manual-transcript",
        fileSize: Buffer.byteLength(transcript || "", "utf8"),
        mimeType: "text/plain",
      },
    });

    // Auto-trigger AI processing
    try {
      const processUrl = new URL("/api/recordings/process", req.url);
      await fetch(processUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId: recording.id })
      });
    } catch (error) {
      console.error("Failed to trigger processing:", error);
    }

    console.log(`Recording created and processing triggered: ${recording.id}`);
    
    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      message: "Transcript saved successfully. AI analysis started.",
    });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: "Failed to save transcript" },
      { status: 500 }
    );
  }
}
