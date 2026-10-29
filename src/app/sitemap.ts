import { MetadataRoute } from "next";
import { projects, services, studio } from "@/lib/studio";
import { prisma } from "@/lib/prisma";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    "",
    "/services",
    "/projects",
    "/about",
    "/contact",
    "/partners",
    "/philosophy",
    "/blog",
    "/privacy",
    "/terms",
    "/accessibility",
    "/cookies",
    ...services.map((s) => `/services/${s.slug}`),
    ...projects.map((p) => `/projects/${p.slug}`),
  ];
  const entries: MetadataRoute.Sitemap = pages.map((path) => ({
    url: `${studio.url}${path}`,
    changeFrequency: path === "" ? "monthly" : "yearly",
    priority:
      path === ""
        ? 1
        : ["/services", "/projects", "/contact"].includes(path)
          ? 0.8
          : 0.5,
  }));
  if (process.env.DATABASE_URL) {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      });
      entries.push(
        ...posts.map((post) => ({
          url: `${studio.url}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          priority: 0.6,
        })),
      );
    } catch {
      console.error("Sitemap: published journal entries could not be loaded");
    }
  }
  return entries;
}
