import { getCurrentUser } from "@/lib/auth/requireRole";
import { getBlogPosts, getAuthors } from "@/server/actions/blog";
import { BlogPageClient } from "./BlogPageClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [blogPostsResult, authorsResult] = await Promise.all([
    getBlogPosts(),
    getAuthors(),
  ]);

  const posts = (blogPostsResult.success ? blogPostsResult.posts : []) ?? [];
  const authors = (authorsResult.success ? authorsResult.authors : []) ?? [];

  // Calculate stats (posts is guaranteed to be an array now)
  const totalPosts = posts?.length ?? 0;
  const publishedPosts = posts?.filter((p: any) => p.status === "PUBLISHED").length ?? 0;
  const draftPosts = posts?.filter((p: any) => p.status === "DRAFT").length ?? 0;
  const scheduledPosts = posts?.filter((p: any) => p.status === "SCHEDULED").length ?? 0;

  return (
    <BlogPageClient
      user={user}
      initialData={{
        posts,
        authors,
        stats: {
          total: totalPosts,
          published: publishedPosts,
          drafts: draftPosts,
          scheduled: scheduledPosts,
        },
      }}
    />
  );
}
