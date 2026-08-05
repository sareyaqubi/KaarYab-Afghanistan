"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { useData } from "@/providers/data";
import { JobCard } from "@/components/jobs/job-card";
import { rankJobs } from "@/lib/ranking";

export function FeaturedJobsSection() {
  const { t } = useI18n();
  const { jobs, companies } = useData();

  const companiesById = new Map(companies.map((c) => [c.id, c]));
  const openJobs = jobs.filter((j) => j.status === "open");
  const featured = rankJobs(openJobs, companiesById)
    .filter((j) => j.featured || j.urgent)
    .slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("featuredJobs")}</h2>
          <p className="mt-3 text-muted-foreground">{t("featuredJobsSubtitle")}</p>
        </div>
        <Link
          href="/jobs"
          className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:border-primary/40 hover:text-primary"
        >
          {t("viewAll")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((job, i) => {
          const company = companiesById.get(job.companyId);
          return (
            <JobCard
              key={job.id}
              job={job}
              companyName={company?.name}
              companyLogo={company?.logo}
              companyRating={company?.rating}
              index={i}
            />
          );
        })}
      </div>
    </section>
  );
}
