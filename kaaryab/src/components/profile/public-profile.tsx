"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Sparkles,
} from "lucide-react";

function Github({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function Linkedin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import { useAuth } from "@/providers/auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import type { User } from "@/lib/types";

const availabilityLabel: Record<string, string> = {
  "full-time": "Open to full-time",
  "part-time": "Open to part-time",
  freelance: "Open to freelance",
  remote: "Remote only",
};

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
          {icon}
        </span>
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function PublicProfile({ userId }: { userId: string }) {
  const { users } = useAuth();
  const user: User | undefined = users.find((u) => u.id === userId);

  if (!user) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="Profile not found"
        hint="This profile does not exist or has been removed."
        action={
          <Link href="/" className={buttonVariants({ variant: "gradient" })}>
            Back to home
          </Link>
        }
      />
    );
  }

  if (user.role !== "applicant") {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="Not a public profile"
        hint="Only applicant profiles are publicly visible."
        action={
          <Link href="/" className={buttonVariants({ variant: "gradient" })}>
            Back to home
          </Link>
        }
      />
    );
  }

  const p = user.applicantProfile;
  const firstExp = p?.experience?.[0];
  const lastExp = p?.experience?.[p.experience.length - 1];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/15 to-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar src={p?.photo} name={user.name} size="xl" className="h-28 w-28 ring-4" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{user.name}</h1>
              {user.verified && (
                <Badge variant="info">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-lg font-medium text-primary">{p?.headline ?? "Job seeker"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {p?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {p.location}
                </span>
              )}
              {p?.availability && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {availabilityLabel[p.availability]}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {user.reputation} reputation
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {p?.github && (
                <a href={p.github} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {p?.linkedin && (
                <a href={p.linkedin} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {p?.portfolio && (
                <a href={p.portfolio} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <Globe className="h-4 w-4" />
                  Portfolio
                </a>
              )}
              {p?.email && (
                <a href={`mailto:${p.email}`} className={buttonVariants({ variant: "gradient", size: "sm" })}>
                  <Mail className="h-4 w-4" />
                  Contact
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Skills", value: p?.skills.length ?? 0 },
          { label: "Experience", value: p?.experience.length ?? 0 },
          { label: "Education", value: p?.education.length ?? 0 },
          { label: "Projects", value: p?.projects.length ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-3">
          {p?.bio && (
            <Section icon={<FileText className="h-4 w-4" />} title="About">
              <p className="leading-relaxed text-muted-foreground">{p.bio}</p>
              {p.phone && (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {p.phone}
                </p>
              )}
            </Section>
          )}

          {p && p.experience.length > 0 && (
            <Section icon={<Briefcase className="h-4 w-4" />} title="Experience">
              <div className="space-y-4">
                {p.experience.map((exp, i) => (
                  <div key={i} className="relative pl-5">
                    {i < p.experience.length - 1 && (
                      <span className="absolute left-1.5 top-3 h-full w-px bg-border" />
                    )}
                    <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <div>
                      <p className="font-semibold">{exp.role}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company} • {exp.from}
                        {exp.to ? ` – ${exp.to}` : " – Present"}
                      </p>
                      {exp.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {p && p.projects.length > 0 && (
            <Section icon={<Rocket className="h-4 w-4" />} title="Projects">
              <div className="grid gap-4 sm:grid-cols-2">
                {p.projects.map((proj, i) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="font-semibold">{proj.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{proj.description}</p>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        View project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-2">
          {p && p.skills.length > 0 && (
            <Section icon={<Sparkles className="h-4 w-4" />} title="Skills">
              <div className="flex flex-wrap gap-2">
                {p.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="px-3 py-1">
                    {s}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {p && p.languages.length > 0 && (
            <Section icon={<Languages className="h-4 w-4" />} title="Languages">
              <div className="space-y-2.5">
                {p.languages.map((lang, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-muted-foreground">{lang.level}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {p && p.education.length > 0 && (
            <Section icon={<GraduationCap className="h-4 w-4" />} title="Education">
              <div className="space-y-4">
                {p.education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-semibold">
                      {edu.degree}
                      {edu.field ? ` — ${edu.field}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {edu.school}
                      {edu.from ? ` • ${edu.from}` : ""}
                      {edu.to ? ` – ${edu.to}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {p && (p.certificates.length > 0 || p.awards.length > 0) && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {p.certificates.length > 0 && (
                <Section icon={<FileText className="h-4 w-4" />} title="Certificates">
                  <div className="space-y-3">
                    {p.certificates.map((c, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.issuer} • {c.year}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {p.awards.length > 0 && (
                <Section icon={<Award className="h-4 w-4" />} title="Awards">
                  <div className="space-y-3">
                    {p.awards.map((a, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.issuer} • {a.year}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </div>

      {p && p.cvUrl && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Resume / CV</p>
              <p className="text-xs text-muted-foreground">Download the full resume</p>
            </div>
          </div>
          <a href={p.cvUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View CV
          </a>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {firstExp && lastExp && firstExp !== lastExp
          ? `Professional with experience at ${firstExp.company}${lastExp && lastExp.company !== firstExp.company ? ` and ${lastExp.company}` : ""}.`
          : `Profile last updated as part of KaarYab Afghanistan.`}
      </p>
    </div>
  );
}
