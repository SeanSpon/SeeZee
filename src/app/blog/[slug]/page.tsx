import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FiCalendar, FiUser, FiTag, FiArrowLeft, FiEye } from "react-icons/fi";
import Link from "next/link";
import { incrementViewCount } from "@/server/actions/blog";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: params.slug,
      status: "PUBLISHED",
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  // Increment view count (don't await, fire and forget)
  incrementViewCount(post.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Article */}
        <article className="glass-panel rounded-2xl overflow-hidden">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="aspect-video relative overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Category */}
            {post.category && (
              <div className="mb-4">
                <span className="inline-block bg-trinity-red/10 text-trinity-red px-4 py-2 rounded-full text-sm font-semibold">
                  {post.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-700">
              <div className="flex items-center gap-3">
                {post.author.image && (
                  <img
                    src={post.author.image}
                    alt={post.author.name || ""}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <FiUser className="h-4 w-4" />
                    {post.author.name || post.author.email}
                  </div>
                  <div className="text-xs text-gray-500">Author</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="h-4 w-4" />
                  {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500">Published</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <FiEye className="h-4 w-4" />
                  {post.viewCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="text-xl text-gray-300 italic mb-8 pb-8 border-b border-gray-700">
                {post.excerpt}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mb-4 mt-8">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-white mb-3 mt-6">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-white mb-2 mt-4">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-300">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-trinity-red hover:text-trinity-maroon underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-800 text-trinity-red px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-trinity-red pl-4 italic text-gray-400 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm"
                    >
                      <FiTag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
