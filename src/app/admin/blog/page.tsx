import { getCurrentUser } from "@/lib/auth/requireRole";
import { getBlogPosts, getAuthors } from "@/server/actions/blog";
import { BlogPageClient } from "./BlogPageClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  try {
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
  } catch (error) {
    console.error('Blog Page Error:', error);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-lg">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Blog</h1>
          <p className="text-gray-300 mb-4">
            There was an error loading the blog management page. This could be due to:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6">
            <li>Database connection issue</li>
            <li>Authentication error</li>
            <li>Data retrieval error</li>
          </ul>
          <details className="bg-black/30 p-4 rounded-lg">
            <summary className="text-sm text-gray-400 cursor-pointer">Technical Details</summary>
            <pre className="text-xs text-red-300 mt-2 overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
