"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarDays, Clock, Newspaper } from "lucide-react";
import { blogPosts } from "@/lib/data/blog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatDate } from "@/lib/utils";

export function BlogPage() {
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set(blogPosts.map((p) => p.category));
    return ["All", ...set];
  }, []);

  const filtered = useMemo(() => {
    const list = category === "All" ? blogPosts : blogPosts.filter((p) => p.category === category);
    return [...list].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }, [category]);

  const [featured, ...rest] = filtered;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
          <Newspaper className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">The KaarYab blog</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Career guides, remote work tips, scholarship lists and resources written for Afghan job seekers.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              category === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No articles yet"
          hint="Check back soon for new guides and resources."
        />
      ) : (
        <div className="space-y-10">
          {/* Featured */}
          {featured && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft lg:grid-cols-2"
              >
                <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.cover}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge variant="gradient" className="absolute left-4 top-4">
                    Featured
                  </Badge>
                </div>
                <div className="flex flex-col justify-center gap-3 p-7">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{featured.category}</Badge>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(featured.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight group-hover:text-primary">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground">{featured.excerpt}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{featured.author}</p>
                      <p className="text-xs text-muted-foreground">{featured.authorRole}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                      Read article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.cover}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2.5 p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{post.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="font-bold leading-snug group-hover:text-primary">{post.title}</h2>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                      <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-sky-500/20 text-[10px] font-bold text-primary">
                          {post.author
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <span className="truncate font-medium">{post.author}</span>
                        <span className="ml-auto flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
