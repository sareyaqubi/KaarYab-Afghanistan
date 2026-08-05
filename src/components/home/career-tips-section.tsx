"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { blogPosts } from "@/lib/data/blog";

export function CareerTipsSection() {
  const { t } = useI18n();
  const posts = blogPosts.slice(0, 3);

  return (
    <section className="bg-gradient-to-b from-transparent to-primary/5 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("careerTips")}</h2>
            <p className="mt-3 text-muted-foreground">{t("careerTipsSubtitle")}</p>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:border-primary/40 hover:text-primary"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    width={800}
                    height={176}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="glass-strong absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-primary">
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-bold tracking-tight group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
