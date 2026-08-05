"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  Building2,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { ReviewModal } from "@/components/companies/review-modal";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Review } from "@/lib/types";

export function CompanyProfile({ slug }: { slug: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const { companies, jobs, reviews, followCompany, unfollowCompany, follows } = useData();
  const { currentUser } = useAuth();
  const [reviewOpen, setReviewOpen] = useState(false);

  const company = companies.find((c) => c.slug === slug);

  const openJobs = useMemo(
    () => (company ? jobs.filter((j) => j.companyId === company.id && j.status === "open") : []),
    [jobs, company]
  );

  const companyReviews = useMemo(
    () => (company ? reviews.filter((r) => r.companyId === company.id) : []),
    [reviews, company]
  );

  const followed = currentUser ? follows(currentUser.id, company?.id ?? "") : false;

  if (!company) {
    return (
      <EmptyState
        icon={<Building2 className="h-6 w-6" />}
        title="Company not found"
        hint="The company you are looking for does not exist."
        action={
          <Link href="/companies" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Browse companies
          </Link>
        }
      />
    );
  }

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: companyReviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const maxDist = Math.max(...distribution.map((d) => d.count), 1);

  const toggleFollow = () => {
    if (!currentUser) {
      toast("Log in to follow companies", "info");
      router.push("/login");
      return;
    }
    if (followed) {
      unfollowCompany(currentUser.id, company.id);
      toast("Unfollowed " + company.name, "info");
    } else {
      followCompany(currentUser.id, company.id);
      toast("Following " + company.name);
    }
  };

  const avgOf = (key: keyof Pick<Review, "management" | "communication" | "environment" | "culture" | "growth" | "salaryAccuracy">) => {
    if (companyReviews.length === 0) return 0;
    return companyReviews.reduce((acc, r) => acc + (r[key] as number), 0) / companyReviews.length;
  };

  const factors: { label: string; value: number }[] = [
    { label: "Management", value: avgOf("management") },
    { label: "Culture", value: avgOf("culture") },
    { label: "Growth", value: avgOf("growth") },
    { label: "Environment", value: avgOf("environment") },
    { label: "Communication", value: avgOf("communication") },
  ];

  return (
    <div className="space-y-8">
      {/* Banner + header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
      >
        <div className="relative h-44 sm:h-56">
          <Image
            src={company.banner}
            alt={company.name}
            fill
            sizes="(max-width: 1280px) 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={company.logo} name={company.name} size="xl" className="h-24 w-24 rounded-2xl ring-4 ring-card" />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{company.name}</h1>
                  {company.verified && (
                    <Badge variant="info">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {company.industry}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {company.size}
                  </span>
                </div>
                <div className="mt-2">
                  <RatingStars value={company.rating} count={company.ratingCount} size="sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={followed ? "outline" : "default"} onClick={toggleFollow}>
                <Bell className="h-4 w-4" />
                {followed ? "Following" : "Follow"}
              </Button>
              <Button variant="gradient" onClick={() => setReviewOpen(true)}>
                <Star className="h-4 w-4" />
                Write a review
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Jobs posted", value: company.stats.jobsPosted },
              { label: "Successful hires", value: company.stats.hires },
              { label: "Followers", value: company.followers.length },
              { label: "Response time", value: company.stats.responseTime },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <p className="text-lg font-extrabold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">About {company.name}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{company.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Mail className="h-4 w-4" />
                  {company.email}
                </a>
              )}
              {company.phone && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {company.phone}
                </span>
              )}
            </div>
          </section>

          {company.gallery.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">Life at {company.name}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {company.gallery.map((src, i) => (
                  <div key={i} className="relative h-32 overflow-hidden rounded-xl">
                    <Image src={src} alt={`${company.name} ${i + 1}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 hover:scale-105" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-lg font-bold">
              Open opportunities {openJobs.length > 0 && <span className="text-muted-foreground">({openJobs.length})</span>}
            </h2>
            {openJobs.length === 0 ? (
              <EmptyState
                icon={<Building2 className="h-6 w-6" />}
                title="No open opportunities right now"
                hint="Check back soon or follow this company to get notified."
              />
            ) : (
              <div className="space-y-4">
                {openJobs.map((job, i) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    companyName={company.name}
                    companyLogo={company.logo}
                    companyRating={company.rating}
                    index={i}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Employee ratings</h3>
              <span className="flex items-center gap-1 text-lg font-extrabold">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                {company.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{company.ratingCount} ratings</p>

            <div className="mt-4 space-y-1.5">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{d.star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${(d.count / maxDist) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right tabular-nums text-muted-foreground">{d.count}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-border/60 pt-4">
              {factors.map((f) => (
                <div key={f.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-semibold tabular-nums">{f.value.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500" style={{ width: `${(f.value / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Reviews</h3>
              <span className="text-xs text-muted-foreground">{companyReviews.length}</span>
            </div>
            <div className="mt-4 space-y-5">
              {companyReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
              ) : (
                companyReviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{r.title}</p>
                      <RatingStars value={r.rating} size="sm" />
                    </div>
                    <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{r.content}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar name={r.authorName} size="xs" />
                      <span className="font-medium text-foreground">{r.authorName}</span>
                      {r.verified && <Badge variant="info">Verified</Badge>}
                      <span>• {r.role}</span>
                      <span>• {formatRelativeTime(r.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {companyReviews.length > 3 && (
              <p className="mt-4 text-center text-sm font-semibold text-primary">+{companyReviews.length - 3} more reviews</p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-bold">
              <Clock className="h-4 w-4 text-primary" />
              Company snapshot
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Founded", company.founded],
                ["Size", company.size],
                ["Headquarters", company.location],
                ["Industry", company.industry],
                ["Response time", company.stats.responseTime],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className={cn("text-right font-medium", k === "Founded" && "tabular-nums")}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} companyId={company.id} companyName={company.name} />
    </div>
  );
}
