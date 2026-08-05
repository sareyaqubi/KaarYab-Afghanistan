"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Clock, Copy, Link2 } from "lucide-react";
import { blogPosts, type BlogPost } from "@/lib/data/blog";
import { buttonVariants, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export function BlogPostView({ post }: { post: BlogPost }) {
  const { toast } = useToast();

  const related = blogPosts
    .filter((p) => p.slug !== post.slug && (p.category === post.category || p.category !== post.category))
    .slice(0, 3);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard", "success");
    } catch {
      toast("Could not copy link", "error");
    }
  };

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link href="/blog" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="mt-6 flex items-center justify-between border-y border-border py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-sky-500/20 text-sm font-bold text-primary">
              {post.author
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <p className="text-sm font-semibold">{post.author}</p>
              <p className="text-xs text-muted-foreground">{post.authorRole}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
        </div>
      </motion.header>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.cover}
        alt={post.title}
        className="aspect-[16/9] w-full rounded-2xl border border-border object-cover"
      />

      <div className="space-y-5">
        {post.content.map((paragraph, i) => (
          <p key={i} className={i === 0 ? "text-lg leading-relaxed" : "leading-relaxed text-foreground/90"}>
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
        <Link2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm text-muted-foreground">Found this useful? Share it with a friend looking for work in Afghanistan.</span>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="pt-4">
          <h2 className="text-xl font-bold">Keep reading</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
              >
                <Badge variant="secondary">{p.category}</Badge>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {p.readTime}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
