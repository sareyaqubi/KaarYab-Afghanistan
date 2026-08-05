"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  Flame,
  MapPin,
  Star,
} from "lucide-react";
import type { Job } from "@/lib/types";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { cn, daysUntil, formatSalary } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { categoryLabels, jobTypeLabels } from "@/lib/data/constants";
import { useToast } from "@/components/ui/toast";

interface JobCardProps {
  job: Job;
  companyName?: string;
  companyLogo?: string;
  companyRating?: number;
  index?: number;
}

export function JobCard({ job, companyName, companyLogo, companyRating, index = 0 }: JobCardProps) {
  const { isSaved, saveJob, unsaveJob } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const saved = currentUser ? isSaved(currentUser.id, job.id) : false;
  const days = daysUntil(job.deadline);
  const filled = job.status === "filled" || job.filledPositions >= job.positions;
  const ratio = Math.round((job.filledPositions / job.positions) * 100);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast("Log in to save opportunities", "info");
      return;
    }
    if (saved) {
      unsaveJob(currentUser.id, job.id);
      toast("Removed from saved", "info");
    } else {
      saveJob(currentUser.id, job.id);
      toast("Opportunity saved");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/jobs/${job.id}`}
        className={cn(
          "group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft hover:border-primary/30",
          filled && "opacity-75"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {companyLogo ? (
              <Image
                src={companyLogo}
                alt={companyName ?? "Company"}
                width={52}
                height={52}
                className="rounded-xl ring-1 ring-border"
              />
            ) : (
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="line-clamp-1 font-bold tracking-tight group-hover:text-primary">
                {job.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{companyName}</span>
                {typeof companyRating === "number" && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {companyRating.toFixed(1)}
                  </span>
                )}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 font-medium text-primary">
                  <Briefcase className="h-3 w-3" />
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={toggleSave}
            aria-label={saved ? "Remove from saved" : "Save opportunity"}
            className={cn(
              "rounded-lg p-2 transition-colors",
              saved
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">
            {categoryLabels[job.category]}
          </Badge>
          <Badge variant="outline">{jobTypeLabels[job.type]}</Badge>
          {job.remote ? (
            <Badge variant="info">{job.remote ? "Remote" : "On-site"}</Badge>
          ) : (
            <Badge variant="outline">On-site</Badge>
          )}
          {job.featured && <Badge variant="gold">Featured</Badge>}
          {job.urgent && (
            <Badge variant="danger">
              <Flame className="h-3 w-3" />
              Urgent
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3">
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              days <= 3 ? "text-rose-500" : "text-muted-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {days > 0 ? `${days} days left` : "Closed"}
          </span>
          {filled ? (
            <Badge variant="secondary">Position Filled</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              {job.positions - job.filledPositions} of {job.positions} open
              <span className="ml-2 inline-flex h-1.5 w-16 overflow-hidden rounded-full bg-muted align-middle">
                <span
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, ratio)}%` }}
                />
              </span>
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
