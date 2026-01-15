"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { revalidatePath } from "next/cache";
import { BlogStatus } from "@prisma/client";

export async function getBlogPosts() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const posts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, posts };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return { success: false, error: "Failed to fetch blog posts" };
  }
}

export async function getAuthors() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const authors = await prisma.user.findMany({
      where: {
        role: {
          in: ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, authors };
  } catch (error) {
    console.error("Error fetching authors:", error);
    return { success: false, error: "Failed to fetch authors" };
  }
}

export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: BlogStatus;
  tags?: string[];
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  publishedAt?: Date;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/blog");
    return { success: true, post };
  } catch (error) {
    console.error("Error creating blog post:", error);
    return { success: false, error: "Failed to create blog post" };
  }
}

export async function updateBlogPost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    status?: BlogStatus;
    tags?: string[];
    category?: string;
    seoTitle?: string;
    seoDescription?: string;
    featured?: boolean;
    publishedAt?: Date | null;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/blog");
    return { success: true, post };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return { success: false, error: "Failed to update blog post" };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: "Failed to delete blog post" };
  }
}

export async function incrementViewCount(id: string) {
  try {
    await prisma.blogPost.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return { success: false, error: "Failed to increment view count" };
  }
}
