import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { generatePageMetadata } from "@/lib/metadata";
import { generateArticleSchema } from "@/lib/seo-utils";
export const dynamic = "force-dynamic";
const getPost = cache((slug: string) =>
  prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  }),
);
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post)
    return { title: "Post not found", robots: { index: false, follow: false } };
  return generatePageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
    path: `/blog/${slug}`,
    ogImage: post.coverImage || "/opengraph-image",
    type: "article",
  });
}
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const schema = generateArticleSchema({
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.coverImage || "https://seezeestudios.com/opengraph-image",
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    authorName: post.author.name || "SeeZee Studios",
    url: `https://seezeestudios.com/blog/${slug}`,
  });
  return (
    <article className="studio-container studio-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <Link className="studio-text-link" href="/blog">
        ← Back to journal
      </Link>
      <p className="studio-eyebrow">{post.category || "Studio journal"}</p>
      <h1>{post.title}</h1>
      <div className="studio-article-byline">
        <span>{post.author.name || "SeeZee Studios"}</span>
        {post.publishedAt && (
          <time dateTime={post.publishedAt.toISOString()}>
            {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>
      {post.coverImage && (
        <img
          className="studio-article-cover"
          src={post.coverImage}
          alt={post.title}
        />
      )}
      <div className="studio-prose">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
