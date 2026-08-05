"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  Flag,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { categoryLabels } from "@/lib/data/constants";
import type { ApplicationStatus } from "@/lib/types";

const statusConfig: Record<ApplicationStatus, { label: string; variant: "secondary" | "info" | "warning" | "success" | "danger" }> = {
  pending: { label: "Pending", variant: "secondary" },
  viewed: { label: "Viewed", variant: "info" },
  shortlisted: { label: "Shortlisted", variant: "warning" },
  interview: { label: "Interview", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  withdrawn: { label: "Withdrawn", variant: "secondary" },
};

type Tab = "overview" | "users" | "companies" | "jobs" | "applications" | "reports";

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
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

export function AdminDashboard() {
  const { toast } = useToast();
  const { users, setUsers } = useAuth();
  const { companies, jobs, applications, reports, updateCompany, updateJob, updateReport } = useData();
  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const jobsById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);
  const companiesById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  const openReports = reports.filter((r) => r.status === "open").length;

  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of users) counts.set(u.role, (counts.get(u.role) ?? 0) + 1);
    return [...counts.entries()].map(([role, count]) => ({ role, count }));
  }, [users]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const j of jobs) counts.set(j.category, (counts.get(j.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [jobs]);

  const timeline = useMemo(() => {
    const months: { key: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en", { month: "short" }), count: 0 });
    }
    for (const a of applications) {
      const d = new Date(a.submittedAt);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) m.count += 1;
    }
    return months;
  }, [applications]);

  const toggleVerify = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u)));
    toast("Verification toggled", "info");
  };

  const q = query.trim().toLowerCase();

  const filteredUsers = users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const filteredCompanies = companies.filter((c) => !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  const filteredJobs = jobs.filter((j) => !q || j.title.toLowerCase().includes(q) || (companiesById.get(j.companyId)?.name.toLowerCase() ?? "").includes(q));
  const filteredReports = reports.filter(
    (r) => !q || (jobsById.get(r.jobId)?.title.toLowerCase() ?? "").includes(q) || r.reason.toLowerCase().includes(q)
  );

  const tabList: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users", badge: users.length },
    { key: "companies", label: "Companies", badge: companies.length },
    { key: "jobs", label: "Jobs", badge: jobs.length },
    { key: "applications", label: "Applications", badge: applications.length },
    { key: "reports", label: "Reports", badge: openReports },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Platform admin</h1>
            <p className="text-sm text-muted-foreground">Moderate content and monitor platform health</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search everything…" className="pl-9" />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={<UsersIcon className="h-5 w-5 text-sky-500" />} label="Users" value={users.length} tone="bg-sky-500/10" />
        <StatCard icon={<Building2 className="h-5 w-5 text-teal-500" />} label="Companies" value={companies.length} tone="bg-teal-500/10" />
        <StatCard icon={<Briefcase className="h-5 w-5 text-violet-500" />} label="Jobs" value={jobs.length} tone="bg-violet-500/10" />
        <StatCard icon={<FileText className="h-5 w-5 text-amber-500" />} label="Applications" value={applications.length} tone="bg-amber-500/10" />
        <StatCard icon={<Flag className="h-5 w-5 text-rose-500" />} label="Open reports" value={openReports} tone="bg-rose-500/10" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {tabList.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === tb.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tb.label}
            {typeof tb.badge === "number" && tb.badge > 0 && (
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", tab === tb.key ? "bg-white/25" : "bg-primary/10 text-primary")}>
                {tb.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Platform activity</h2>
                <p className="text-xs text-muted-foreground">Applications across the last 6 months</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="gradAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gradAdmin)" name="Applications" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold">Users by role</h2>
              <div className="mt-4 space-y-3">
                {roleCounts.map((r) => {
                  const max = Math.max(...roleCounts.map((x) => x.count), 1);
                  return (
                    <div key={r.role} className="flex items-center gap-3 text-sm">
                      <span className="w-24 capitalize text-muted-foreground">{r.role}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500" style={{ width: `${(r.count / max) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right font-semibold tabular-nums">{r.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold">Jobs by category</h2>
              <div className="mt-4 space-y-3">
                {categoryCounts.map(([cat, count]) => {
                  const max = Math.max(...categoryCounts.map((x) => x[1]), 1);
                  return (
                    <div key={cat} className="flex items-center gap-3 text-sm">
                      <span className="w-32 truncate text-muted-foreground">{categoryLabels[cat as keyof typeof categoryLabels] ?? cat}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${(count / max) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right font-semibold tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Avatar src={u.applicantProfile?.photo} name={u.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{u.name}</p>
                  <Badge variant="outline">{u.role}</Badge>
                  {u.verified ? <Badge variant="success">Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{u.email} • Joined {formatDate(u.createdAt)} • Rep {u.reputation}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleVerify(u.id)}>
                <BadgeCheck className="h-3.5 w-3.5" />
                {u.verified ? "Unverify" : "Verify"}
              </Button>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No users match" hint="Try a different search." />
          )}
        </div>
      )}

      {/* Companies */}
      {tab === "companies" && (
        <div className="space-y-3">
          {filteredCompanies.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Avatar src={c.logo} name={c.name} size="sm" className="rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{c.name}</p>
                  {c.verified && (
                    <Badge variant="info">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {c.featured && <Badge variant="gold">Featured</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.industry} • {c.location} • {c.followers.length} followers • ⭐ {c.rating.toFixed(1)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { updateCompany(c.id, { verified: !c.verified }); toast("Updated", "info"); }}>
                <BadgeCheck className="h-3.5 w-3.5" />
                {c.verified ? "Unverify" : "Verify"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { updateCompany(c.id, { featured: !c.featured }); toast("Updated", "info"); }}>
                <Star className="h-3.5 w-3.5" />
                {c.featured ? "Unfeature" : "Feature"}
              </Button>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <EmptyState icon={<Building2 className="h-6 w-6" />} title="No companies match" hint="Try a different search." />
          )}
        </div>
      )}

      {/* Jobs */}
      {tab === "jobs" && (
        <div className="space-y-3">
          {filteredJobs.map((j) => {
            const company = companiesById.get(j.companyId);
            return (
              <div key={j.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/jobs/${j.id}`} className="font-semibold hover:text-primary">{j.title}</Link>
                    <Badge variant="outline">{categoryLabels[j.category]}</Badge>
                    <Badge variant={j.status === "open" ? "success" : "secondary"}>{j.status}</Badge>
                    {j.featured && <Badge variant="gold">Featured</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {company?.name} • {j.applications} applications • {j.views} views
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { updateJob(j.id, { featured: !j.featured }); toast("Updated", "info"); }}>
                  <Star className="h-3.5 w-3.5" />
                  {j.featured ? "Unfeature" : "Feature"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateJob(j.id, { status: j.status === "archived" ? "open" : "archived" });
                    toast("Updated", "info");
                  }}
                >
                  {j.status === "archived" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {j.status === "archived" ? "Reopen" : "Archive"}
                </Button>
              </div>
            );
          })}
          {filteredJobs.length === 0 && (
            <EmptyState icon={<Briefcase className="h-6 w-6" />} title="No jobs match" hint="Try a different search." />
          )}
        </div>
      )}

      {/* Applications */}
      {tab === "applications" && (
        applications.length === 0 ? (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="No applications yet" hint="Applications will appear here as users apply." />
        ) : (
          <div className="space-y-3">
            {applications.map((a) => {
              const applicant = usersById.get(a.applicantId);
              const job = jobsById.get(a.jobId);
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <Avatar src={applicant?.applicantProfile?.photo} name={applicant?.name ?? "Applicant"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{applicant?.name ?? "Applicant"}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {job?.title ?? "Job"} • {formatRelativeTime(a.submittedAt)}
                    </p>
                  </div>
                  <Badge variant={statusConfig[a.status].variant}>{statusConfig[a.status].label}</Badge>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Reports */}
      {tab === "reports" && (
        reports.length === 0 ? (
          <EmptyState icon={<Flag className="h-6 w-6" />} title="No reports" hint="When users report opportunities, they appear here for review." />
        ) : (
          <div className="space-y-3">
            {filteredReports.map((r) => {
              const job = jobsById.get(r.jobId);
              const reporter = r.reporterId === "guest" ? null : usersById.get(r.reporterId);
              return (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/jobs/${r.jobId}`} className="font-semibold hover:text-primary">{job?.title ?? "Job"}</Link>
                        <Badge variant="danger">{r.reason}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Reported by {reporter?.name ?? "Guest"} • {formatRelativeTime(r.createdAt)}
                      </p>
                      {r.detail && <p className="mt-2 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">{r.detail}</p>}
                    </div>
                    <Badge variant={r.status === "resolved" ? "success" : r.status === "reviewed" ? "info" : "warning"}>{r.status}</Badge>
                    {r.status === "open" && (
                      <Button variant="outline" size="sm" onClick={() => { updateReport(r.id, "reviewed"); toast("Marked as reviewed", "info"); }}>
                        Mark reviewed
                      </Button>
                    )}
                    {r.status !== "resolved" && (
                      <Button variant="gradient" size="sm" onClick={() => { updateReport(r.id, "resolved"); toast("Resolved", "info"); }}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredReports.length === 0 && (
              <EmptyState icon={<Flag className="h-6 w-6" />} title="No reports match" hint="Try a different search." />
            )}
          </div>
        )
      )}
    </div>
  );
}
