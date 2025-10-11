"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { ChannelType } from "@prisma/client";

type ChannelType = "GENERAL" | "PROJECT" | "SUPPORT" | "DEVELOPMENT" | "CUSTOM";

export async function createMessage(channelId: string, content: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Uncomment after migration
    // const message = await prisma.chatMessage.create({
    //   data: {
    //     content,
    //     channelId,
    //     authorId: user.id,
    //   },
    //   include: {
    //     author: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //         image: true,
    //       }
    //     }
    //   }
    // });

    revalidatePath("/admin/feed");

    return {
      success: true,
      // message,
    };
  } catch (error) {
    console.error("Error creating message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create message",
    };
  }
}

export async function createChannel(name: string, description: string, type: ChannelType = "GENERAL") {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    // Only ADMIN users can create channels
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Only admins can create channels");
    }

    // TODO: Uncomment after migration
    // const channel = await prisma.channel.create({
    //   data: {
    //     name,
    //     description,
    //     type,
    //     members: {
    //       create: {
    //         userId: user.id,
    //       }
    //     }
    //   },
    //   include: {
    //     _count: {
    //       select: { members: true }
    //     }
    //   }
    // });

    revalidatePath("/admin/feed");

    return {
      success: true,
      // channel,
    };
  } catch (error) {
    console.error("Error creating channel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create channel",
    };
  }
}

export async function joinChannel(channelId: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Uncomment after migration
    // await prisma.channelMember.create({
    //   data: {
    //     channelId,
    //     userId: user.id,
    //   }
    // });

    revalidatePath("/admin/feed");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error joining channel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to join channel",
    };
  }
}
