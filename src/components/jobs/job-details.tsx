"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Flame,
  Globe,
  GraduationCap,
  MapPin,
  Share2,
  Timer,
  Users,
} from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { useI18n } from "@/providers/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { JobCard } from "@/components/jobs/job-card";
import { ApplyModal } from "@/components/jobs/apply-modal";
import { ShareModal } from "@/components/jobs/share-modal";
import { ReportModal } from "@/components/jobs/report-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatSalary, cn, daysUntil, formatDate } from "@/lib/utils";
import { categoryLabels, experienceLabels, jobTypeLabels } from "@/lib/data/constants";
import { rankJobs } from "@/lib/ranking";
import { useToast } from "@/components/ui/toast";

const statusMeta: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary" | "danger" }> = {
  pending: { label: "Pending", variant: "secondary" },
  viewed: { label: "Viewed", variant: "info" },
  shortlisted: { label: "Shortlisted", variant: "warning" },
  interview: { label: "Interview", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  withdrawn: { label: "Withdrawn", variant: "secondary" },
};

export function JobDetails({ jobId }: { jobId: string }) {
  const { t } = useI18n();
  const { jobs, companies, applications, incrementViews, isSaved, saveJob, unsaveJob, updateApplicationStatus } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const job = jobs.find((j) => j.id === jobId);
  const company = job ? companies.find((c) => c.id === job.companyId) : undefined;

  const [applyOpen, setApplyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (job) incrementViews(job.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const myApplication = useMemo(
    () =>
      currentUser && job
        ? applications.find((a) => a.applicantId === currentUser.id && a.jobId === job.id)
        : undefined,
    [applications, currentUser, job]
  );

  const saved = currentUser && job ? isSaved(currentUser.id, job.id) : false;
  const isEmployerViewing = currentUser?.role === "employer" || currentUser?.role === "admin";

  if (!job || !company) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title={t("job.jobNotFound")}
          hint={t("job.jobNotFoundHint")}
          action={
            <Button variant="outline" onClick={() => router.push("/jobs")}>
              {t("job.backToJobs")}
            </Button>
          }
        />
      </div>
    );
  }

  const filled = job.status === "filled" || job.filledPositions >= job.positions;
  const days = daysUntil(job.deadline);
  const related = rankJobs(jobs.filter((j) => j.id !== job.id && j.category === job.category), companiesMap())
    .slice(0, 3);

  function companiesMap() {
    return new Map(companies.map((c) => [c.id, c]));
  }

  const toggleSave = () => {
    if (!currentUser) {
      toast(t("app.mustLogin"), "info");
      router.push("/login");
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

  const handleApply = () => {
    if (!currentUser) {
      toast(t("app.mustLogin"), "info");
      router.push("/login");
      return;
    }
    if (currentUser.role !== "applicant") {
      toast(t("app.mustBeApplicant"), "error");
      return;
    }
    setApplyOpen(true);
  };

  const withdraw = () => {
    if (!myApplication) return;
    updateApplicationStatus(myApplication.id, "withdrawn");
    toast("Application withdrawn", "info");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/jobs"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("job.backToJobs")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="min-w-0">
          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="absolute inset-x-0 top-0 h-1 gradient-brand" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-16 w-16 rounded-2xl ring-1 ring-border"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{job.title}</h1>
                    {job.featured && <Badge variant="gold">Featured</Badge>}
                    {job.urgent && (
                      <Badge variant="danger">
                        <Flame className="h-3 w-3" />
                        {t("job.urgent")}
                      </Badge>
                    )}
                  </div>
                  <Link
                    href={`/companies/${company.slug}`}
                    className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                  >
                    {company.name}
                    {company.verified && <BadgeCheck className="h-4 w-4" />}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {t("job.posted")} {formatDate(job.postedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {job.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {job.applications} applicants
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">{categoryLabels[job.category]}</Badge>
              <Badge variant="outline">{jobTypeLabels[job.type]}</Badge>
              {job.remote ? <Badge variant="info">{t("job.remote")}</Badge> : <Badge variant="outline">{t("job.onsite")}</Badge>}
              <Badge variant="outline">{experienceLabels[job.experience]}</Badge>
            </div>

            {/* Action bar */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/70 pt-5">
              {filled || job.status === "archived" ? (
                <Button variant="secondary" size="lg" disabled>
                  <CheckCircle2 className="h-4 w-4" />
                  {t("job.filled")}
                </Button>
              ) : myApplication ? (
                <>
                  <Button variant="secondary" size="lg" disabled>
                    <CheckCircle2 className="h-4 w-4" />
                    {t("job.applied")}
                  </Button>
                  {myApplication.status !== "withdrawn" && (
                    <Button variant="ghost" size="lg" onClick={withdraw}>
                      Withdraw
                    </Button>
                  )}
                </>
              ) : isEmployerViewing ? (
                <Button variant="secondary" size="lg" disabled>
                  {t("app.mustBeApplicant")}
                </Button>
              ) : (
                <Button variant="gradient" size="lg" onClick={handleApply}>
                  {t("job.apply")}
                </Button>
              )}
              <Button variant="outline" size="lg" onClick={toggleSave}>
                <Bookmark className={cn("h-4 w-4", saved && "fill-current text-primary")} />
                {saved ? t("job.saved") : t("job.save")}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShareOpen(true)}>
                <Share2 className="h-4 w-4" />
                {t("job.share")}
              </Button>
              <Button variant="ghost" size="lg" onClick={() => setReportOpen(true)} className="text-muted-foreground">
                <Flag className="h-4 w-4" />
                {t("job.report")}
              </Button>
            </div>

            {/* Application status banner */}
            {myApplication && myApplication.status !== "withdrawn" && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-bold text-primary">Application status</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className={cn("h-2.5 w-2.5 rounded-full animate-pulse-dot", myApplication.status === "pending" && "bg-amber-400")} />
                  <span className="text-sm font-semibold">
                    {statusMeta[myApplication.status]?.label ?? myApplication.status}
                  </span>
                  {myApplication.status === "pending" && (
                    <span className="text-xs text-muted-foreground">The employer has been notified. You&apos;ll be updated as things progress.</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Description */}
          <Section title="Description">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{job.description}</p>
          </Section>

          <Section title={t("job.responsibilities")}>
            <ul className="space-y-2.5">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t("job.requirements")}>
            <ul className="space-y-2.5">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t("job.benefits")}>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  {b}
                </span>
              ))}
            </div>
          </Section>

          {/* Quick facts grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FactCard icon={<Timer className="h-4 w-4" />} label={t("job.workingHours")} value={job.workingHours ?? "—"} />
            <FactCard icon={<GraduationCap className="h-4 w-4" />} label={t("job.education")} value={job.education ?? "—"} />
            <FactCard icon={<Briefcase className="h-4 w-4" />} label={t("job.experience")} value={experienceLabels[job.experience]} />
          </div>

          {job.languageRequirements && job.languageRequirements.length > 0 && (
            <Section title="Languages required">
              <div className="flex flex-wrap gap-2">
                {job.languageRequirements.map((l) => (
                  <Badge key={l} variant="secondary">
                    {l}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          <Section title={t("job.skills")}>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </Section>

          <Section title={t("job.aboutCompany")}>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <img src={company.logo} alt={company.name} className="h-12 w-12 rounded-xl ring-1 ring-border" />
                <div>
                  <Link href={`/companies/${company.slug}`} className="font-bold hover:text-primary">
                    {company.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {company.industry} · {company.size} · {company.founded}
                  </p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{company.description}</p>
              <Link href={`/companies/${company.slug}`} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                View company profile →
              </Link>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="sticky top-24 space-y-5">
            {/* Quick facts */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold">Quick facts</h3>
              <div className="mt-4 space-y-3.5 text-sm">
                <FactRow icon={<Briefcase className="h-4 w-4" />} label={t("job.salary")} value={formatSalary(job.salaryMin, job.salaryMax, job.currency)} />
                <FactRow icon={<CalendarDays className="h-4 w-4" />} label={t("job.deadline")} value={formatDate(job.deadline)} />
                <FactRow
                  icon={<Timer className="h-4 w-4" />}
                  label={t("job.daysLeft")}
                  value={
                    days > 0 ? (
                      <span className={cn("font-bold", days <= 3 ? "text-rose-500" : "text-emerald-500")}>{days} {t("job.daysLeft")}</span>
                    ) : (
                      <span className="font-bold text-rose-500">Closed</span>
                    )
                  }
                />
                <FactRow icon={<Users className="h-4 w-4" />} label={t("job.positions")} value={`${job.positions - job.filledPositions} ${t("job.openPositions")}`} />
                <FactRow icon={<Globe className="h-4 w-4" />} label="Type" value={jobTypeLabels[job.type]} />
              </div>

              {/* Positions progress */}
              <div className="mt-5 border-t border-border/70 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("job.positionsFilled")}</span>
                  <span className="font-bold">
                    {job.filledPositions}/{job.positions}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", filled ? "bg-rose-500" : "gradient-brand")}
                    style={{ width: `${Math.min(100, (job.filledPositions / job.positions) * 100)}%` }}
                  />
                </div>
                {filled && <p className="mt-2 text-xs font-semibold text-rose-500">This position has been filled.</p>}
              </div>
            </div>

            {/* Company card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <img src={company.logo} alt={company.name} className="h-12 w-12 rounded-xl ring-1 ring-border" />
                <div>
                  <Link href={`/companies/${company.slug}`} className="font-bold hover:text-primary">
                    {company.name}
                  </Link>
                  <RatingStars value={company.rating} count={company.ratingCount} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-center">
                <MiniStat label="Jobs" value={String(jobs.filter((j) => j.companyId === company.id).length)} />
                <MiniStat label="Followers" value={String(company.followers.length)} />
                <MiniStat label="Hires" value={String(company.stats.hires)} />
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={() => router.push(`/companies/${company.slug}`)}>
                <Building2 className="h-4 w-4" />
                View company
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Related jobs */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{t("job.relatedJobs")}</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((rj, i) => {
              const rc = companies.find((c) => c.id === rj.companyId);
              return (
                <JobCard
                  key={rj.id}
                  job={rj}
                  companyName={rc?.name}
                  companyLogo={rc?.logo}
                  companyRating={rc?.rating}
                  index={i}
                />
              );
            })}
          </div>
        </div>
      )}

      {job && (
        <>
          <ApplyModal
            open={applyOpen}
            onClose={() => setApplyOpen(false)}
            job={job}
            employerId={company.id}
          />
          <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={job.title} />
          <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} jobId={job.id} />
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function FactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-extrabold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
