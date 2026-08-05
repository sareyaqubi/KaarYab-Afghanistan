"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, Building2, MapPin, Search, Users } from "lucide-react";
import { useData } from "@/providers/data";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { RatingStars } from "@/components/ui/rating-stars";

export function CompaniesPage() {
  const { companies, jobs } = useData();
  const [query, setQuery] = useState("");

  const openCount = (id: string) => jobs.filter((j) => j.companyId === id && j.status === "open").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = companies.filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    });
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }, [companies, query]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Explore companies</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Discover Afghanistan&apos;s leading employers, read verified reviews and find your next opportunity.
        </p>
        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, industry or location…"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No companies found"
          hint="Try a different search term."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/companies/${c.slug}`}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <Avatar src={c.logo} name={c.name} size="lg" className="rounded-2xl" />
                  {c.featured && <Badge variant="gold">Featured</Badge>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold group-hover:text-primary">{c.name}</h2>
                    {c.verified && (
                      <BadgeCheck className="h-4 w-4 shrink-0 fill-sky-500/15 text-sky-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.industry}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <RatingStars value={c.rating} count={c.ratingCount} />
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {c.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {c.followers.length} followers
                  </span>
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <Building2 className="h-3.5 w-3.5" />
                    {openCount(c.id)} open jobs
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
