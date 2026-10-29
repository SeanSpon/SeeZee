import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PageIntro, ContactBand } from "@/components/marketing/Studio";
import { generatePageMetadata } from "@/lib/metadata";
export const dynamic = "force-dynamic";
export const metadata = generatePageMetadata({
  title: "Studio Journal",
  description:
    "Notes, project updates, and practical technology insights from SeeZee Studios in Louisville, Kentucky.",
  path: "/blog",
});
export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      category: true,
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
  });
  return (
    <>
      <PageIntro label="Studio journal" title="Notes from the work.">
        <p>
          Project updates, practical ideas, and things we’re learning along the
          way.
        </p>
      </PageIntro>
      <section className="studio-container studio-journal">
        {posts.length ? (
          posts.map((post) => (
            <article className="studio-journal-entry" key={post.id}>
              <div>
                <span className="studio-eyebrow">
                  {post.category || "Studio notes"}
                </span>
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
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title} ↗</Link>
              </h2>
              {post.excerpt && <p>{post.excerpt}</p>}
              <span>{post.author.name || "SeeZee Studios"}</span>
            </article>
          ))
        ) : (
          <div className="studio-note">
            <h2>More to share soon.</h2>
            <p>In the meantime, take a look at what we’ve been building.</p>
            <Link className="studio-text-link" href="/projects">
              Explore our work ↗
            </Link>
          </div>
        )}
      </section>
      <ContactBand />
    </>
  );
}
