import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Bot Client Webhook API
 *
 * External endpoint that the Clawd bot client running on a remote PC
 * uses to register, heartbeat, poll for tasks, and report results.
 *
 * Authentication: via `x-bot-key` header containing the registrationKey.
 */

async function authenticateBot(req: NextRequest) {
  const key = req.headers.get("x-bot-key");
  if (!key) return null;
  const bot = await prisma.clawdBot.findUnique({ where: { registrationKey: key } });
  return bot;
}

// GET - Bot polls for pending tasks and sends heartbeat
export async function GET(req: NextRequest) {
  try {
    const bot = await authenticateBot(req);
    if (!bot) {
      return NextResponse.json({ error: "Invalid bot key" }, { status: 401 });
    }

    // Update heartbeat
    await prisma.clawdBot.update({
      where: { id: bot.id },
      data: { lastSeen: new Date(), status: bot.status === "OFFLINE" ? "ONLINE" : bot.status },
    });

    // Fetch pending tasks
    const tasks = await prisma.botTask.findMany({
      where: { botId: bot.id, status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      botId: bot.id,
      name: bot.name,
      tasks: tasks.map((t) => ({ id: t.id, task: t.task, createdAt: t.createdAt })),
    });
  } catch (error) {
    console.error("[Bot API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Bot reports task progress/completion or registers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── Register: no auth needed, uses the registration key from admin ──
    if (action === "register") {
      const { registrationKey, machineName } = body;
      if (!registrationKey) {
        return NextResponse.json({ error: "registrationKey is required" }, { status: 400 });
      }

      const bot = await prisma.clawdBot.findUnique({
        where: { registrationKey },
      });

      if (!bot) {
        return NextResponse.json({ error: "Invalid registration key" }, { status: 404 });
      }

      // Update bot as online with machine info
      const updated = await prisma.clawdBot.update({
        where: { id: bot.id },
        data: {
          status: "ONLINE",
          lastSeen: new Date(),
          machineId: machineName || bot.machineId,
        },
      });

      return NextResponse.json({
        success: true,
        botId: updated.id,
        name: updated.name,
        message: `Bot "${updated.name}" connected from ${updated.machineId}`,
      });
    }

    // ── All other actions require bot auth ──
    const bot = await authenticateBot(req);
    if (!bot) {
      return NextResponse.json({ error: "Invalid bot key" }, { status: 401 });
    }

    switch (action) {
      case "heartbeat": {
        await prisma.clawdBot.update({
          where: { id: bot.id },
          data: { lastSeen: new Date(), status: "ONLINE" },
        });
        return NextResponse.json({ ok: true });
      }

      case "task-start": {
        const { taskId } = body;
        if (!taskId) {
          return NextResponse.json({ error: "taskId required" }, { status: 400 });
        }
        await prisma.botTask.update({
          where: { id: taskId },
          data: { status: "IN_PROGRESS" },
        });
        await prisma.clawdBot.update({
          where: { id: bot.id },
          data: { status: "BUSY", currentTask: (await prisma.botTask.findUnique({ where: { id: taskId } }))?.task },
        });
        return NextResponse.json({ ok: true });
      }

      case "task-complete": {
        const { taskId, result } = body;
        if (!taskId) {
          return NextResponse.json({ error: "taskId required" }, { status: 400 });
        }
        await prisma.botTask.update({
          where: { id: taskId },
          data: { status: "COMPLETED", result: result || "Completed" },
        });
        // Check if there are more pending tasks
        const pending = await prisma.botTask.count({
          where: { botId: bot.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
        });
        await prisma.clawdBot.update({
          where: { id: bot.id },
          data: { status: pending > 0 ? "BUSY" : "ONLINE", currentTask: null },
        });
        return NextResponse.json({ ok: true });
      }

      case "task-fail": {
        const { taskId, result } = body;
        if (!taskId) {
          return NextResponse.json({ error: "taskId required" }, { status: 400 });
        }
        await prisma.botTask.update({
          where: { id: taskId },
          data: { status: "FAILED", result: result || "Failed" },
        });
        await prisma.clawdBot.update({
          where: { id: bot.id },
          data: { status: "ONLINE", currentTask: null },
        });
        return NextResponse.json({ ok: true });
      }

      case "disconnect": {
        await prisma.clawdBot.update({
          where: { id: bot.id },
          data: { status: "OFFLINE", currentTask: null },
        });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Bot API] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
