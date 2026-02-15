"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { updateBlogPost } from "@/server/actions/blog";
import { BlogStatus } from "@prisma/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status: BlogStatus;
  tags: string[];
  category?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured: boolean;
  publishedAt?: Date | string | null;
}

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${id}`);
        if (!response.ok) throw new Error("Failed to fetch post");
        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        alert("Failed to load blog post");
        router.push("/admin/blog");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const tags = formData.get("tags")?.toString().split(",").map(t => t.trim()).filter(Boolean) || [];
    const status = formData.get("status")?.toString() as BlogStatus;

    try {
      const result = await updateBlogPost(id, {
        title: formData.get("title")?.toString() || "",
        slug: formData.get("slug")?.toString() || "",
        excerpt: formData.get("excerpt")?.toString() || undefined,
        content: formData.get("content")?.toString() || "",
        coverImage: formData.get("coverImage")?.toString() || undefined,
        status,
        tags,
        category: formData.get("category")?.toString() || undefined,
        seoTitle: formData.get("seoTitle")?.toString() || undefined,
        seoDescription: formData.get("seoDescription")?.toString() || undefined,
        featured: formData.get("featured") === "on",
        publishedAt: status === "PUBLISHED" && !post?.publishedAt ? new Date() : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update blog post");
      }

      router.push("/admin/blog");
    } catch (error: any) {
      console.error("Failed to update blog post:", error);
      alert(`Failed to update blog post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Edit Blog Post</h1>
        <p className="text-gray-400">Update your blog post</p>
      </div>

      <div className="glass-panel p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={post.title}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              placeholder="Enter post title..."
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
              URL Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              defaultValue={post.slug}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              placeholder="url-friendly-slug"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={post.excerpt || ""}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent resize-none"
              placeholder="Brief summary of the post..."
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={15}
              defaultValue={post.content}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent font-mono text-sm resize-none"
              placeholder="Write your blog post content here (Markdown supported)..."
              required
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                defaultValue={post.category || ""}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="e.g., Web Development"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                defaultValue={post.tags.join(", ")}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="react, nextjs, tutorial"
              />
            </div>
          </div>

          {/* SEO Fields */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white">SEO Settings</h3>
            
            <div>
              <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-300 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                id="seoTitle"
                name="seoTitle"
                defaultValue={post.seoTitle || ""}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="Custom title for search engines"
              />
            </div>

            <div>
              <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-300 mb-2">
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                rows={2}
                defaultValue={post.seoDescription || ""}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent resize-none"
                placeholder="Meta description for search engines"
              />
            </div>
          </div>

          {/* Status & Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-700">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={post.status}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
              >
                <option value="DRAFT">Draft</option>
                <option value="REVIEW">Review</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                defaultValue={post.coverImage || ""}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={post.featured}
                  className="w-5 h-5 bg-gray-900 border border-gray-700 rounded text-trinity-red focus:ring-2 focus:ring-trinity-red focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">Featured Post</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-trinity-red to-trinity-maroon text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
