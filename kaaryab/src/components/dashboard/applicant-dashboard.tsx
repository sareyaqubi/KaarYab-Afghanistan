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
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Globe,
  Inbox,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  Star,
  TrendingUp,
  Video,
} from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { rankJobs } from "@/lib/ranking";
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

const interviewModeMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  online: { label: "Online", icon: <Globe className="h-4 w-4" /> },
  offline: { label: "In person", icon: <MapPin className="h-4 w-4" /> },
  video: { label: "Video call", icon: <Video className="h-4 w-4" /> },
  phone: { label: "Phone", icon: <Phone className="h-4 w-4" /> },
};

const notificationMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  application: { label: "Application", icon: <Briefcase className="h-4 w-4" />, color: "text-sky-500 bg-sky-500/10" },
  application_viewed: { label: "Application viewed", icon: <FileText className="h-4 w-4" />, color: "text-indigo-500 bg-indigo-500/10" },
  interview: { label: "Interview", icon: <CalendarDays className="h-4 w-4" />, color: "text-violet-500 bg-violet-500/10" },
  accepted: { label: "Accepted", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500 bg-emerald-500/10" },
  rejected: { label: "Rejected", icon: <Clock className="h-4 w-4" />, color: "text-rose-500 bg-rose-500/10" },
  deadline: { label: "Deadline", icon: <CalendarClock className="h-4 w-4" />, color: "text-amber-500 bg-amber-500/10" },
  message: { label: "Message", icon: <MessageSquare className="h-4 w-4" />, color: "text-sky-500 bg-sky-500/10" },
  recommendation: { label: "Recommendation", icon: <Sparkles className="h-4 w-4" />, color: "text-teal-500 bg-teal-500/10" },
  saved_update: { label: "Saved update", icon: <Bookmark className="h-4 w-4" />, color: "text-teal-500 bg-teal-500/10" },
  system: { label: "System", icon: <Inbox className="h-4 w-4" />, color: "text-slate-500 bg-slate-500/10" },
  review: { label: "Review", icon: <Star className="h-4 w-4" />, color: "text-amber-500 bg-amber-500/10" },
  follower: { label: "Follower", icon: <Bell className="h-4 w-4" />, color: "text-pink-500 bg-pink-500/10" },
};

type Tab = "overview" | "applied" | "saved" | "interviews" | "notifications";

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

export function ApplicantDashboard() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { applications, jobs, companies, savedJobs, interviews, notifications, conversations, unsaveJob, isSaved, updateApplicationStatus, markNotificationsRead, markNotificationRead } = useData();
  const [tab, setTab] = useState<Tab>("overview");

  const uid = currentUser?.id ?? "";
  const companiesById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);
  const jobsById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

  const myApplications = useMemo(
    () =>
      applications
        .filter((a) => a.applicantId === uid)
        .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt)),
    [applications, uid]
  );
  const mySaved = useMemo(() => savedJobs.filter((s) => s.userId === uid), [savedJobs, uid]);
  const myInterviews = useMemo(
    () =>
      interviews
        .filter((i) => i.applicantId === uid)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [interviews, uid]
  );
  const myNotifs = useMemo(
    () => notifications.filter((n) => n.userId === uid),
    [notifications, uid]
  );
  const myConvos = useMemo(
    () => conversations.filter((c) => c.participants.includes(uid)),
    [conversations, uid]
  );

  const unreadCount = useMemo(() => {
    let n = 0;
    for (const c of myConvos) for (const m of c.messages) if (m.senderId !== uid && !m.readBy.includes(uid)) n += 1;
    return n;
  }, [myConvos, uid]);

  const unreadNotifs = myNotifs.filter((n) => !n.read).length;

  const completion = useMemo(() => {
    const p = currentUser?.applicantProfile;
    if (!p) return 0;
    const checks = [
      !!p.headline,
      !!p.bio,
      !!p.photo,
      !!p.phone,
      !!p.location,
      p.skills.length > 0,
      p.languages.length > 0,
      p.education.length > 0,
      p.experience.length > 0,
      p.projects.length > 0 || !!p.cvUrl,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [currentUser]);

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

  const recommended = useMemo(() => {
    const applied = new Set(myApplications.map((a) => a.jobId));
    const pool = jobs.filter((j) => j.status === "open" && !applied.has(j.id));
    return rankJobs(pool, companiesById).slice(0, 3);
  }, [jobs, myApplications, companiesById]);

  if (!currentUser) return null;

  const firstName = currentUser.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const withdraw = (app: Application) => {
    updateApplicationStatus(app.id, "withdrawn");
    toast("Application withdrawn", "info");
  };

  const openNotif = (id: string) => {
    markNotificationRead(id);
  };

  const tabList: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "applied", label: "Applied", badge: myApplications.length },
    { key: "saved", label: "Saved", badge: mySaved.length },
    { key: "interviews", label: "Interviews", badge: myInterviews.length },
    { key: "notifications", label: "Notifications", badge: unreadNotifs },
  ];

  const renderApplications = (apps: Application[]) => (
    <div className="space-y-3">
      {apps.map((a) => {
        const job = jobsById.get(a.jobId);
        if (!job) return null;
        const company = companiesById.get(job.companyId);
        const cfg = statusConfig[a.status];
        return (
          <Link
            key={a.id}
            href={`/jobs/${job.id}`}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{job.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {company?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Applied {formatRelativeTime(a.submittedAt)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
              {a.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    withdraw(a);
                  }}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Greeting header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={currentUser.applicantProfile?.photo}
              name={currentUser.name}
              size="lg"
              className="h-16 w-16"
            />
            <div>
              <p className="text-sm text-muted-foreground">{greeting},</p>
              <h1 className="text-2xl font-extrabold tracking-tight">{firstName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentUser.applicantProfile?.headline ?? "Find your next opportunity"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--muted)" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${completion} ${100 - completion}`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{completion}%</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Profile strength</p>
                <p className="text-xs text-muted-foreground">Complete your profile to get noticed</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/u/${currentUser.id}`}
                className={buttonVariants({ variant: "ghost" })}
                aria-label="View public profile"
              >
                <Eye className="h-4 w-4" />
                View profile
              </Link>
              <Link href="/profile" className={buttonVariants({ variant: "outline" })}>
                <Sparkles className="h-4 w-4" />
                Edit profile
              </Link>
              <Link href="/jobs" className={buttonVariants({ variant: "gradient" })}>
                Browse jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-sky-500" />}
          label="Applications sent"
          value={myApplications.length}
          tone="bg-sky-500/10"
        />
        <StatCard
          icon={<Bookmark className="h-5 w-5 text-teal-500" />}
          label="Saved opportunities"
          value={mySaved.length}
          tone="bg-teal-500/10"
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5 text-violet-500" />}
          label="Interviews"
          value={myInterviews.length}
          tone="bg-violet-500/10"
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5 text-emerald-500" />}
          label="Unread messages"
          value={unreadCount}
          tone="bg-emerald-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 lg:col-span-3"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Application activity</h2>
              <p className="text-xs text-muted-foreground">Applications sent in the last 6 months</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="gradDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gradDash)" name="Applications" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
        >
          <h2 className="font-bold">Status breakdown</h2>
          <p className="text-xs text-muted-foreground">Where your applications stand</p>
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
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                    />
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
        </motion.div>
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

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Recent applications</h2>
              <Link href="/jobs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View all jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {myApplications.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No applications yet"
                hint="Start exploring opportunities and apply to your first one."
                action={
                  <Link href="/jobs" className={buttonVariants({ variant: "gradient" })}>
                    Explore opportunities
                  </Link>
                }
              />
            ) : (
              renderApplications(myApplications.slice(0, 5))
            )}
          </section>

          {recommended.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Recommended for you</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recommended.map((job, i) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    companyName={companiesById.get(job.companyId)?.name}
                    companyLogo={companiesById.get(job.companyId)?.logo}
                    companyRating={companiesById.get(job.companyId)?.rating}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "applied" && (
        myApplications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title="No applications yet"
            hint="When you apply to opportunities they will show up here."
            action={
              <Link href="/jobs" className={buttonVariants({ variant: "gradient" })}>
                Explore opportunities
              </Link>
            }
          />
        ) : (
          renderApplications(myApplications)
        )
      )}

      {tab === "saved" && (
        mySaved.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-6 w-6" />}
            title="Nothing saved yet"
            hint="Bookmark opportunities you are interested in to compare them later."
            action={
              <Link href="/jobs" className={buttonVariants({ variant: "gradient" })}>
                Browse opportunities
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mySaved.map((s, i) => {
              const job = jobsById.get(s.jobId);
              if (!job) return null;
              return (
                <div key={s.jobId} className="relative">
                  <JobCard
                    job={job}
                    companyName={companiesById.get(job.companyId)?.name}
                    companyLogo={companiesById.get(job.companyId)?.logo}
                    companyRating={companiesById.get(job.companyId)?.rating}
                    index={i}
                  />
                  {uid && isSaved(uid, job.id) && (
                    <button
                      onClick={() => {
                        unsaveJob(uid, job.id);
                        toast("Removed from saved", "info");
                      }}
                      className="absolute right-5 top-5 z-10 rounded-lg bg-background/90 p-2 shadow-sm backdrop-blur"
                      aria-label="Remove from saved"
                    >
                      <Bookmark className="h-4 w-4 fill-primary text-primary" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "interviews" && (
        myInterviews.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No interviews scheduled"
            hint="When an employer shortlists you, interview invitations will appear here."
          />
        ) : (
          <div className="space-y-3">
            {myInterviews.map((iv) => {
              const job = jobsById.get(iv.jobId);
              const company = companiesById.get(iv.companyId);
              const mode = interviewModeMeta[iv.mode] ?? { label: iv.mode, icon: <CalendarDays className="h-4 w-4" /> };
              return (
                <div key={iv.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
                    {mode.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{job?.title ?? "Opportunity"}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {company?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(iv.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {iv.time}
                      </span>
                      <Badge variant="outline">{mode.label}</Badge>
                    </p>
                  </div>
                  <Badge
                    variant={iv.status === "completed" ? "success" : iv.status === "cancelled" ? "danger" : "warning"}
                  >
                    {iv.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "notifications" && (
        myNotifs.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            title="All caught up"
            hint="Updates about your applications, interviews and saved jobs appear here."
          />
        ) : (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => markNotificationsRead(uid)}>
                Mark all as read
              </Button>
            </div>
            {myNotifs.map((n) => {
              const meta = notificationMeta[n.type] ?? { label: "Update", icon: <Bell className="h-4 w-4" />, color: "text-slate-500 bg-slate-500/10" };
              return (
                <button
                  key={n.id}
                  onClick={() => openNotif(n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                    n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                  )}
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.color)}>
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
