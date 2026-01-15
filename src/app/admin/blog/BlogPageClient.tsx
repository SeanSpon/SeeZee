"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { EnhancedStatCard } from "@/components/admin/shared/EnhancedStatCard";
import { FiFileText, FiEdit, FiEye, FiTrash2, FiPlus, FiStar } from "react-icons/fi";
import type { CurrentUser } from "@/lib/auth/requireRole";
import { deleteBlogPost } from "@/server/actions/blog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  status: string;
  publishedAt?: Date | string | null;
  author: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  tags: string[];
  category?: string | null;
  viewCount: number;
  featured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface Author {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

interface BlogPageClientProps {
  user: CurrentUser;
  initialData: {
    posts: BlogPost[];
    authors: Author[];
    stats: {
      total: number;
      published: number;
      drafts: number;
      scheduled: number;
    };
  };
}

export function BlogPageClient({ user, initialData }: BlogPageClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialData.posts);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(postId);
    try {
      const result = await deleteBlogPost(postId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete blog post");
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      router.refresh();
    } catch (error: any) {
      console.error("Failed to delete blog post:", error);
      alert(`Failed to delete blog post: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (postId: string) => {
    router.push(`/admin/blog/${postId}`);
  };

  const handleView = (slug: string) => {
    window.open(`/blog/${slug}`, "_blank");
  };

  const handleCreatePost = () => {
    router.push("/admin/blog/new");
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: "gray",
      REVIEW: "yellow",
      SCHEDULED: "blue",
      PUBLISHED: "green",
      ARCHIVED: "gray",
    };
    return statusMap[status] || "gray";
  };

  const columns: DataTableColumn<BlogPost>[] = [
    {
      header: "Post",
      key: "title",
      render: (post) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-heading text-sm font-semibold text-white">{post.title}</p>
            {post.featured && <FiStar className="h-4 w-4 text-yellow-400" title="Featured" />}
          </div>
          {post.excerpt && <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt}</p>}
          {post.category && (
            <span className="inline-block text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
              {post.category}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (post) => <StatusBadge status={post.status} size="sm" />,
    },
    {
      header: "Author",
      key: "author",
      render: (post) => (
        <div className="flex items-center gap-2">
          {post.author.image && (
            <img src={post.author.image} alt={post.author.name || ""} className="w-6 h-6 rounded-full" />
          )}
          <span className="text-sm text-gray-300">{post.author.name || post.author.email}</span>
        </div>
      ),
    },
    {
      header: "Views",
      key: "viewCount",
      render: (post) => (
        <div className="flex items-center gap-2">
          <FiEye className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-300">{post.viewCount.toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: "Published",
      key: "publishedAt",
      render: (post) => (
        <span className="text-xs text-gray-400">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Not published"}
        </span>
      ),
    },
    {
      header: "Tags",
      key: "tags",
      render: (post) => (
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (post) => (
        <div className="flex items-center gap-2">
          {post.status === "PUBLISHED" && (
            <button
              onClick={() => handleView(post.slug)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="View post"
            >
              <FiEye className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          )}
          <button
            onClick={() => handleEdit(post.id)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Edit post"
          >
            <FiEdit className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={() => handleDelete(post.id, post.title)}
            disabled={deleting === post.id}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Delete post"
          >
            <FiTrash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">Blog Posts</h1>
          <p className="text-gray-400">Manage and publish blog content</p>
        </div>
        <button
          onClick={handleCreatePost}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-trinity-red to-trinity-maroon text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <FiPlus className="h-5 w-5" />
          New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatCard
          label="Total Posts"
          value={initialData.stats.total}
          icon={FiFileText}
          iconColor="blue"
        />
        <EnhancedStatCard
          label="Published"
          value={initialData.stats.published}
          icon={FiEye}
          iconColor="green"
        />
        <EnhancedStatCard
          label="Drafts"
          value={initialData.stats.drafts}
          icon={FiEdit}
          iconColor="gray"
        />
        <EnhancedStatCard
          label="Scheduled"
          value={initialData.stats.scheduled}
          icon={FiFileText}
          iconColor="yellow"
        />
      </div>

      {/* Posts Table */}
      <div className="glass-panel p-6">
        <DataTable
          data={posts}
          columns={columns}
          emptyMessage="No blog posts found. Create your first post to get started."
        />
      </div>
    </div>
  );
}
