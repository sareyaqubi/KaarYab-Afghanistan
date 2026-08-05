import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteLayout } from "@/components/layout/site-layout";
import { BlogPostView } from "@/components/blog/blog-post";
import { blogPosts } from "@/lib/data/blog";

interface BlogPostRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Article not found — KaarYab Afghanistan" };
  return {
    title: `${post.title} — KaarYab Afghanistan`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.cover }],
    },
  };
}

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <BlogPostView post={post} />
      </div>
    </SiteLayout>
  );
}
