"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  UserRound,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { PostJobModal } from "@/components/dashboard/post-job-modal";
import { ScheduleInterviewModal } from "@/components/dashboard/schedule-interview-modal";
import { cn, daysUntil, formatRelativeTime } from "@/lib/utils";
import { categoryLabels } from "@/lib/data/constants";
import type { Application, ApplicationStatus } from "@/lib/types";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: "secondary" | "info" | "warning" | "success" | "danger"; color: string }
> = {
  pending: { label: "Pending", variant: "secondary", color: "#94a3b8" },
  viewed: { label: "Viewed", variant: "info", color: "#0ea5e9" },
  shortlisted: { label: "Shortlisted", variant: "warning", color: "#f59e0b" },
  interview: { label: "Interview", variant: "warning", color: "#8b5cf6" },
  accepted: { label: "Accepted", variant: "success", color: "#10b981" },
  rejected: { label: "Rejected", variant: "danger", color: "#f43f5e" },
  withdrawn: { label: "Withdrawn", variant: "secondary", color: "#64748b" },
};

const interviewModeLabels: Record<string, string> = {
  online: "Online",
  offline: "In person",
  video: "Video call",
  phone: "Phone",
};

type Tab = "overview" | "postings" | "applications" | "interviews" | "analytics";

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tone)}>{icon}</span>
        <span className="text-3xl font-extrabold tabular-nums">{value}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export function EmployerDashboard() {
  const { toast } = useToast();
  const { currentUser, users } = useAuth();
  const { jobs, companies, applications, interviews, conversations, updateApplicationStatus, updateJob } = useData();
  const [tab, setTab] = useState<Tab>("overview");
  const [postOpen, setPostOpen] = useState(false);
  const [interviewApp, setInterviewApp] = useState<Application | null>(null);
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const [search, setSearch] = useState("");

  const company = currentUser?.companyId ? companies.find((c) => c.id === currentUser.companyId) : undefined;

  const myJobs = useMemo(
    () => jobs.filter((j) => j.companyId === company?.id),
    [jobs, company]
  );

  const myApplications = useMemo(
    () =>
      applications
        .filter((a) => a.companyId === company?.id)
        .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt)),
    [applications, company]
  );

  const myInterviews = useMemo(
    () =>
      interviews
        .filter((i) => i.companyId === company?.id)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [interviews, company]
  );

  const myConvos = useMemo(
    () => conversations.filter((c) => c.participants.includes(currentUser?.id ?? "")),
    [conversations, currentUser]
  );

  const unreadCount = useMemo(() => {
    let n = 0;
    for (const c of myConvos)
      for (const m of c.messages)
        if (m.senderId !== currentUser?.id && !m.readBy.includes(currentUser?.id ?? "")) n += 1;
    return n;
  }, [myConvos, currentUser]);

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const jobsById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

  const activeJobs = myJobs.filter((j) => j.status === "open").length;

  const timeline = useMemo(() => {
    const months: { key: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en", { month: "short" }),
        count: 0,
      });
    }
    for (const a of myApplications) {
      const d = new Date(a.submittedAt);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) m.count += 1;
    }
    return months;
  }, [myApplications]);

  const statusData = useMemo(() => {
    const counts = new Map<ApplicationStatus, number>();
    for (const a of myApplications) counts.set(a.status, (counts.get(a.status) ?? 0) + 1);
    return [...counts.entries()].map(([status, value]) => ({
      name: statusConfig[status].label,
      value,
      color: statusConfig[status].color,
    }));
  }, [myApplications]);

  const topJobs = useMemo(() => [...myJobs].sort((a, b) => b.views - a.views).slice(0, 5), [myJobs]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myApplications.filter((a) => {
      if (jobFilter !== "all" && a.jobId !== jobFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (q) {
        const applicant = usersById.get(a.applicantId);
        const job = jobsById.get(a.jobId);
        const name = applicant?.name.toLowerCase() ?? "";
        const title = job?.title.toLowerCase() ?? "";
        if (!name.includes(q) && !title.includes(q)) return false;
      }
      return true;
    });
  }, [myApplications, jobFilter, statusFilter, search, usersById, jobsById]);

  if (!currentUser) return null;

  const setStatus = (app: Application, status: ApplicationStatus, label: string) => {
    updateApplicationStatus(app.id, status);
    toast(`Application ${label}`);
  };

  const tabList: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "postings", label: "Postings", badge: myJobs.length },
    { key: "applications", label: "Applications", badge: myApplications.length },
    { key: "interviews", label: "Interviews", badge: myInterviews.length },
    { key: "analytics", label: "Analytics" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={company?.logo} name={company?.name ?? currentUser.name} size="lg" className="h-16 w-16 rounded-2xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{company?.name ?? "Employer"}</h1>
                {company?.verified && (
                  <Badge variant="info">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {company?.location ?? "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {company?.industry ?? "—"}
                </span>
              </p>
            </div>
          </div>
          <Button variant="gradient" onClick={() => setPostOpen(true)}>
            <Plus className="h-4 w-4" />
            Post a job
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Briefcase className="h-5 w-5 text-sky-500" />} label="Active jobs" value={activeJobs} tone="bg-sky-500/10" />
        <StatCard icon={<Users className="h-5 w-5 text-teal-500" />} label="Total applications" value={myApplications.length} tone="bg-teal-500/10" />
        <StatCard icon={<CalendarDays className="h-5 w-5 text-violet-500" />} label="Interviews" value={myInterviews.length} tone="bg-violet-500/10" />
        <StatCard icon={<MessageSquare className="h-5 w-5 text-emerald-500" />} label="Unread messages" value={unreadCount} tone="bg-emerald-500/10" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {tabList.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === tb.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tb.label}
            {typeof tb.badge === "number" && tb.badge > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  tab === tb.key ? "bg-white/25" : "bg-primary/10 text-primary"
                )}
              >
                {tb.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-8">
          {myApplications.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Recent applications</h2>
                <Button variant="ghost" size="sm" onClick={() => setTab("applications")}>
                  Manage all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {myApplications.slice(0, 5).map((a) => {
                  const job = jobsById.get(a.jobId);
                  const applicant = usersById.get(a.applicantId);
                  return (
                    <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                      <Avatar name={applicant?.name ?? "Applicant"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{applicant?.name ?? "Applicant"}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          Applied to {job?.title ?? "a job"} • {formatRelativeTime(a.submittedAt)}
                        </p>
                      </div>
                      <Badge variant={statusConfig[a.status].variant}>{statusConfig[a.status].label}</Badge>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Top performing jobs</h2>
              <Button variant="ghost" size="sm" onClick={() => setTab("postings")}>
                View postings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {topJobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No jobs posted yet"
                hint="Post your first opportunity to start receiving applications."
                action={
                  <Button variant="gradient" onClick={() => setPostOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Post a job
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {topJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold">{job.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{categoryLabels[job.category]}</p>
                      </div>
                      <Badge variant={job.status === "open" ? "success" : "secondary"}>{job.status}</Badge>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {job.applications} applications
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {job.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {daysUntil(job.deadline) > 0 ? `${daysUntil(job.deadline)}d left` : "Closed"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Postings */}
      {tab === "postings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Job postings</h2>
              <p className="text-sm text-muted-foreground">Manage and track your open opportunities</p>
            </div>
            <Button variant="gradient" onClick={() => setPostOpen(true)}>
              <Plus className="h-4 w-4" />
              Post a job
            </Button>
          </div>
          {myJobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-6 w-6" />}
              title="No jobs posted yet"
              hint="Post your first opportunity to start receiving applications."
              action={
                <Button variant="gradient" onClick={() => setPostOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Post a job
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {myJobs.map((job) => {
                const filled = job.status === "filled" || job.filledPositions >= job.positions;
                return (
                  <div key={job.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/jobs/${job.id}`} className="truncate font-semibold hover:text-primary">
                          {job.title}
                        </Link>
                        <Badge variant="outline">{categoryLabels[job.category]}</Badge>
                        {filled && <Badge variant="secondary">Filled</Badge>}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.applications} applications
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {job.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysUntil(job.deadline) > 0 ? `${daysUntil(job.deadline)} days left` : "Deadline passed"}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/jobs/${job.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                      {job.status === "open" && !filled && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            updateJob(job.id, { filledPositions: job.positions, status: "filled" });
                            toast("Job marked as filled", "info");
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark filled
                        </Button>
                      )}
                      {job.status === "archived" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateJob(job.id, { status: "open" });
                            toast("Job reopened", "info");
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Reopen
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateJob(job.id, { status: "archived" });
                            toast("Job archived", "info");
                          }}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Applications */}
      {tab === "applications" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicants or jobs…"
                className="pl-9"
              />
            </div>
            <Select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="sm:w-56">
              <option value="all">All jobs</option>
              {myJobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | ApplicationStatus)} className="sm:w-44">
              <option value="all">All statuses</option>
              {(Object.keys(statusConfig) as ApplicationStatus[]).map((s) => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </Select>
          </div>

          {filteredApps.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No applications match"
              hint="Try adjusting your filters, or wait for applicants to apply."
            />
          ) : (
            <div className="space-y-3">
              {filteredApps.map((a) => {
                const job = jobsById.get(a.jobId);
                const applicant = usersById.get(a.applicantId);
                const alreadyFinal = ["accepted", "rejected", "withdrawn"].includes(a.status);
                return (
                  <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Avatar src={applicant?.applicantProfile?.photo} name={applicant?.name ?? "Applicant"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{applicant?.name ?? "Applicant"}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {job?.title} • {formatRelativeTime(a.submittedAt)}
                        </p>
                      </div>
                      <Badge variant={statusConfig[a.status].variant}>{statusConfig[a.status].label}</Badge>
                    </div>
                    {a.message && <p className="mt-3 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">{a.message}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                      {a.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => setStatus(a, "viewed", "marked as viewed")}>
                          <Eye className="h-3.5 w-3.5" />
                          Mark viewed
                        </Button>
                      )}
                      {!alreadyFinal && a.status !== "shortlisted" && a.status !== "interview" && (
                        <Button variant="secondary" size="sm" onClick={() => setStatus(a, "shortlisted", "shortlisted")}>
                          <UserRound className="h-3.5 w-3.5" />
                          Shortlist
                        </Button>
                      )}
                      {!alreadyFinal && (
                        <Button variant="gradient" size="sm" onClick={() => setInterviewApp(a)}>
                          <CalendarDays className="h-3.5 w-3.5" />
                          Schedule interview
                        </Button>
                      )}
                      {!alreadyFinal && (
                        <>
                          <Button variant="default" size="sm" onClick={() => setStatus(a, "accepted", "accepted")}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accept
                          </Button>
                          <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => setStatus(a, "rejected", "rejected")}>
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interviews */}
      {tab === "interviews" && (
        myInterviews.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No interviews scheduled"
            hint="Schedule interviews from the applications tab to invite candidates."
          />
        ) : (
          <div className="space-y-3">
            {myInterviews.map((iv) => {
              const job = jobsById.get(iv.jobId);
              const applicant = usersById.get(iv.applicantId);
              return (
                <div key={iv.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{applicant?.name ?? "Applicant"} — {job?.title ?? "Job"}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(iv.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {iv.time}
                      </span>
                      <Badge variant="outline">{interviewModeLabels[iv.mode] ?? iv.mode}</Badge>
                    </p>
                  </div>
                  <Badge variant={iv.status === "completed" ? "success" : iv.status === "cancelled" ? "danger" : "warning"}>
                    {iv.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Applications over time</h2>
                  <p className="text-xs text-muted-foreground">Last 6 months</p>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="gradEmp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gradEmp)" name="Applications" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h2 className="font-bold">Status breakdown</h2>
              <p className="text-xs text-muted-foreground">Pipeline health</p>
              {statusData.length === 0 ? (
                <p className="mt-10 text-center text-sm text-muted-foreground">No applications yet.</p>
              ) : (
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3} stroke="none">
                          {statusData.map((s) => (
                            <Cell key={s.name} fill={s.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {statusData.map((s) => (
                      <div key={s.name} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="flex-1 truncate text-muted-foreground">{s.name}</span>
                        <span className="font-semibold tabular-nums">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Most viewed jobs</h2>
            </div>
            {topJobs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No jobs yet.</p>
            ) : (
              <div className="space-y-3">
                {topJobs.map((job) => {
                  const max = Math.max(...topJobs.map((j) => j.views), 1);
                  return (
                    <div key={job.id} className="flex items-center gap-4">
                      <div className="w-40 truncate text-sm font-medium">{job.title}</div>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500" style={{ width: `${(job.views / max) * 100}%` }} />
                      </div>
                      <div className="w-16 text-right text-sm font-semibold tabular-nums">{job.views}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <PostJobModal open={postOpen} onClose={() => setPostOpen(false)} />
      <ScheduleInterviewModal open={!!interviewApp} onClose={() => setInterviewApp(null)} application={interviewApp} />
    </div>
  );
}
