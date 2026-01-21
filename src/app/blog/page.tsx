import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FiCalendar, FiUser, FiTag, FiArrowRight } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
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
    orderBy: {
      publishedAt: "desc",
    },
  });

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-5xl font-bold text-white mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights, tutorials, and stories from the team
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <Link href={`/blog/${featuredPost.slug}`}>
              <div className="glass-panel overflow-hidden rounded-2xl hover:scale-[1.02] transition-transform duration-300">
                {featuredPost.coverImage && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-trinity-red text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      {featuredPost.publishedAt && new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiUser className="h-4 w-4" />
                      {featuredPost.author.name || featuredPost.author.email}
                    </div>
                  </div>
                  <h2 className="font-heading text-3xl font-bold text-white mb-4 hover:text-trinity-red transition-colors">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-gray-400 text-lg mb-4 line-clamp-2">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  {featuredPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full"
                        >
                          <FiTag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Posts Grid */}
        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="glass-panel rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 h-full flex flex-col">
                  {post.coverImage && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="h-3 w-3" />
                        {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUser className="h-3 w-3" />
                        {post.author.name || post.author.email.split('@')[0]}
                      </div>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-2 hover:text-trinity-red transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center text-trinity-red font-semibold text-sm mt-auto pt-4 border-t border-gray-700">
                      Read More
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !featuredPost && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No blog posts published yet. Check back soon!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
