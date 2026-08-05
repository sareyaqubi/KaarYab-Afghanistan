"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  MapPin,
  PencilLine,
  Plus,
  Rocket,
  Save,
  Sparkles,
  Trash2,
  UserRound,
  Wand2,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/auth";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type {
  ApplicantProfile,
  Award as AwardItem,
  Certificate,
  Education,
  Project,
  WorkExperience,
} from "@/lib/types";

const emptyEducation: Education = { degree: "", field: "", school: "", from: "", to: "", current: false };
const emptyExperience: WorkExperience = { role: "", company: "", from: "", to: "", current: false, description: "" };
const emptyProject: Project = { name: "", description: "", url: "" };
const emptyCertificate: Certificate = { name: "", issuer: "", year: "" };
const emptyAward: AwardItem = { name: "", issuer: "", year: "" };

const languageLevels = ["Beginner", "Intermediate", "Advanced", "Fluent", "Native"];

function SectionCard({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-sky-500/15 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ListItemCard({
  onRemove,
  title,
  children,
}: {
  onRemove: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative rounded-xl border border-border bg-muted/30 p-4">
      <button
        onClick={onRemove}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${title ?? "item"}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

interface ReviewResult {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
}

export function ProfileEditor() {
  const { toast } = useToast();
  const { currentUser, updateUser } = useAuth();

  const [draft, setDraft] = useState<ApplicantProfile>(() =>
    currentUser?.applicantProfile ?? {
      skills: [],
      languages: [],
      education: [],
      experience: [],
      projects: [],
      certificates: [],
      awards: [],
    }
  );
  const [skillInput, setSkillInput] = useState("");
  const [dirty, setDirty] = useState(false);
  const [review, setReview] = useState<{ state: "idle" | "loading" | "done"; result?: ReviewResult }>({ state: "idle" });
  const [letterRole, setLetterRole] = useState("");
  const [letterCompany, setLetterCompany] = useState("");
  const [letterLoading, setLetterLoading] = useState(false);
  const [letter, setLetter] = useState("");

  const completion = useMemo(() => {
    const checks = [
      !!draft.headline,
      !!draft.bio,
      !!draft.photo,
      !!draft.phone,
      !!draft.location,
      draft.skills.length > 0,
      draft.languages.length > 0,
      draft.education.length > 0,
      draft.experience.length > 0,
      draft.projects.length > 0 || !!draft.cvUrl,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [draft]);

  if (!currentUser) return null;

  const firstName = currentUser.name.split(" ")[0];

  const patch = (updates: Partial<ApplicantProfile>) => {
    setDraft((d) => ({ ...d, ...updates }));
    setDirty(true);
  };

  const setEducation = (i: number, updates: Partial<Education>) => {
    patch({ education: draft.education.map((e, idx) => (idx === i ? { ...e, ...updates } : e)) });
  };
  const setExperience = (i: number, updates: Partial<WorkExperience>) => {
    patch({ experience: draft.experience.map((e, idx) => (idx === i ? { ...e, ...updates } : e)) });
  };
  const setProject = (i: number, updates: Partial<Project>) => {
    patch({ projects: draft.projects.map((p, idx) => (idx === i ? { ...p, ...updates } : p)) });
  };
  const setCertificate = (i: number, updates: Partial<Certificate>) => {
    patch({ certificates: draft.certificates.map((c, idx) => (idx === i ? { ...c, ...updates } : c)) });
  };
  const setAward = (i: number, updates: Partial<AwardItem>) => {
    patch({ awards: draft.awards.map((a, idx) => (idx === i ? { ...a, ...updates } : a)) });
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (draft.skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillInput("");
      return;
    }
    patch({ skills: [...draft.skills, s] });
    setSkillInput("");
  };

  const save = () => {
    updateUser({ applicantProfile: draft });
    setDirty(false);
    toast("Profile saved successfully", "success");
  };

  const reset = () => {
    setDraft(currentUser.applicantProfile ?? { skills: [], languages: [], education: [], experience: [], projects: [], certificates: [], awards: [] });
    setDirty(false);
    toast("Changes discarded", "info");
  };

  const runReview = () => {
    setReview({ state: "loading" });
    setTimeout(() => {
      const missing = (c: boolean, label: string) => (c ? null : label);
      const gaps = [
        missing(!draft.headline, "Add a headline that summarizes who you are"),
        missing(!draft.bio || (draft.bio?.length ?? 0) < 80, "Write a bio of at least 80 characters"),
        missing(!draft.photo, "Upload a professional profile photo"),
        missing(!draft.phone, "Add a phone number so employers can reach you"),
        missing(!draft.location, "Add your location"),
        missing(draft.skills.length < 4, `Add more skills (currently ${draft.skills.length}, aim for 5+)`),
        missing(draft.languages.length === 0, "Add at least one language you speak"),
        missing(draft.education.length === 0, "Add your education history"),
        missing(draft.experience.length === 0, "Add at least one work or volunteer experience"),
        missing(!draft.cvUrl && draft.projects.length === 0, "Attach a CV or add projects"),
        missing(!draft.github && !draft.linkedin && !draft.portfolio, "Link your GitHub, LinkedIn or portfolio"),
      ].filter(Boolean) as string[];

      const strengths = [
        draft.headline && "Strong headline",
        draft.bio && draft.bio.length >= 80 && "Detailed bio",
        draft.skills.length >= 4 && `${draft.skills.length} skills listed`,
        draft.languages.length > 0 && `${draft.languages.length} languages`,
        draft.experience.length > 0 && `${draft.experience.length} experience entries`,
        draft.education.length > 0 && "Education history present",
        draft.projects.length > 0 && `${draft.projects.length} projects`,
        (draft.github || draft.linkedin) && "Professional links shared",
      ].filter(Boolean) as string[];

      const score = completion;
      const verdict =
        score >= 80 ? "Excellent — your profile is interview-ready." : score >= 50 ? "Good progress — a few tweaks will make you stand out." : "Getting started — focus on the essentials below.";
      setReview({ state: "done", result: { score, verdict, strengths, improvements: gaps } });
      toast("Resume review complete", "success");
    }, 1500);
  };

  const generateLetter = () => {
    if (!letterRole.trim() || !letterCompany.trim()) {
      toast("Enter both the role and company", "error");
      return;
    }
    setLetterLoading(true);
    setTimeout(() => {
      const skills = draft.skills.length > 0 ? draft.skills.slice(0, 4).join(", ") : "and related skills I have developed";
      const exp =
        draft.experience.length > 0
          ? `During my time at ${draft.experience[0].company}, I worked as a ${draft.experience[0].role}.`
          : "I have worked on academic and personal projects that prepared me for this role.";
      const education =
        draft.education.length > 0
          ? `I studied ${draft.education[0].field} at ${draft.education[0].school}, where I ${draft.education[0].degree ? `earned a ${draft.education[0].degree}` : "gained hands-on experience"}.`
          : "I am continuously learning and building new skills to grow professionally.";
      setLetter(
        [
          `Dear Hiring Team at ${letterCompany.trim()},`,
          "",
          `My name is ${currentUser.name}, and I am writing to apply for the ${letterRole.trim()} position. ${draft.headline ? `I describe myself as: ${draft.headline}.` : ""}`,
          "",
          education,
          exp,
          `I bring strong capabilities in ${skills}. I am available for ${draft.availability ?? "full-time"} work and would be excited to contribute to ${letterCompany.trim()}'s mission.`,
          "",
          "I would welcome the opportunity to discuss how my background fits your team. Thank you for your time and consideration.",
          "",
          "Best regards,",
          `${currentUser.name}${draft.phone ? `\n${draft.phone}` : ""}${draft.email ? `\n${draft.email}` : ""}`,
        ].join("\n")
      );
      setLetterLoading(false);
      toast("Cover letter generated", "success");
    }, 1400);
  };

  const copyLetter = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      toast("Copied to clipboard", "success");
    } catch {
      toast("Could not copy — select the text manually", "error");
    }
  };

  const checklist = [
    { done: !!draft.headline, label: "Headline" },
    { done: !!draft.bio, label: "Bio" },
    { done: !!draft.photo, label: "Profile photo" },
    { done: draft.skills.length > 0, label: "Skills" },
    { done: draft.education.length > 0, label: "Education" },
    { done: draft.experience.length > 0, label: "Experience" },
    { done: draft.projects.length > 0 || !!draft.cvUrl, label: "Projects or CV" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "icon-sm" })} aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">My profile</h1>
            <p className="text-sm text-muted-foreground">
              Your profile is shared with employers when you apply
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {dirty && (
            <Button variant="ghost" onClick={reset}>
              Discard
            </Button>
          )}
          <Button variant="gradient" onClick={save} disabled={!dirty}>
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basics */}
          <SectionCard icon={<UserRound className="h-5 w-5" />} title="Basic information" hint="How employers see you at a glance">
            <div className="flex items-center gap-4">
              <Avatar src={draft.photo} name={currentUser.name} size="xl" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{currentUser.name}</span>
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3" />
                    {currentUser.verified ? "Verified" : "Applicant"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Headline" className="sm:col-span-2">
                <Input
                  value={draft.headline ?? ""}
                  onChange={(e) => patch({ headline: e.target.value })}
                  placeholder="e.g. Full-stack developer passionate about EdTech"
                />
              </Field>
              <Field label="Bio" className="sm:col-span-2">
                <Textarea
                  value={draft.bio ?? ""}
                  onChange={(e) => patch({ bio: e.target.value })}
                  placeholder="Tell employers about your background, goals and strengths…"
                />
              </Field>
              <Field label="Location">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={draft.location ?? ""}
                    onChange={(e) => patch({ location: e.target.value })}
                    placeholder="Kabul, Afghanistan"
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="Phone">
                <Input
                  value={draft.phone ?? ""}
                  onChange={(e) => patch({ phone: e.target.value })}
                  placeholder="+93 7XX XXX XXX"
                />
              </Field>
              <Field label="Profile photo URL">
                <Input
                  value={draft.photo ?? ""}
                  onChange={(e) => patch({ photo: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Availability">
                <Select value={draft.availability ?? ""} onChange={(e) => patch({ availability: e.target.value as ApplicantProfile["availability"] })}>
                  <option value="">Select availability</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="freelance">Freelance</option>
                  <option value="remote">Remote only</option>
                </Select>
              </Field>
              <Field label="Email for applications">
                <Input
                  value={draft.email ?? ""}
                  onChange={(e) => patch({ email: e.target.value })}
                  placeholder="Leave blank to use your account email"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Links */}
          <SectionCard icon={<ClipboardList className="h-5 w-5" />} title="Links & attachments" hint="Show your work and make it easy for employers to verify you">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GitHub">
                <Input
                  value={draft.github ?? ""}
                  onChange={(e) => patch({ github: e.target.value })}
                  placeholder="https://github.com/…"
                />
              </Field>
              <Field label="LinkedIn">
                <Input
                  value={draft.linkedin ?? ""}
                  onChange={(e) => patch({ linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/…"
                />
              </Field>
              <Field label="Portfolio">
                <Input
                  value={draft.portfolio ?? ""}
                  onChange={(e) => patch({ portfolio: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
              <Field label="CV / resume URL">
                <Input
                  value={draft.cvUrl ?? ""}
                  onChange={(e) => patch({ cvUrl: e.target.value })}
                  placeholder="https://… (PDF preferred)"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Skills */}
          <SectionCard icon={<Code2 className="h-5 w-5" />} title="Skills" hint="Add keywords employers search for">
            <div className="flex flex-wrap gap-2">
              {draft.skills.map((s) => (
                <Badge key={s} variant="secondary" className="px-3 py-1 text-sm">
                  {s}
                  <button
                    onClick={() => patch({ skills: draft.skills.filter((x) => x !== s) })}
                    className="ml-1 rounded-full text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove skill ${s}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {draft.skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet.</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill and press Enter"
                className="max-w-xs"
              />
              <Button variant="outline" onClick={addSkill}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </SectionCard>

          {/* Languages */}
          <SectionCard icon={<Languages className="h-5 w-5" />} title="Languages" hint="List the languages you speak">
            <div className="space-y-3">
              {draft.languages.map((lang, i) => (
                <ListItemCard key={i} onRemove={() => patch({ languages: draft.languages.filter((_, idx) => idx !== i) })} title="language">
                  <Field label="Language">
                    <Input
                      value={lang.name}
                      onChange={(e) => patch({ languages: draft.languages.map((l, idx) => (idx === i ? { ...l, name: e.target.value } : l)) })}
                      placeholder="e.g. Dari, Pashto, English"
                    />
                  </Field>
                  <Field label="Level">
                    <Select
                      value={lang.level}
                      onChange={(e) => patch({ languages: draft.languages.map((l, idx) => (idx === i ? { ...l, level: e.target.value } : l)) })}
                    >
                      <option value="">Select level</option>
                      {languageLevels.map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </ListItemCard>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ languages: [...draft.languages, { name: "", level: "" }] })}
              >
                <Plus className="h-4 w-4" />
                Add language
              </Button>
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard icon={<GraduationCap className="h-5 w-5" />} title="Education" hint="Your degrees, certificates and training">
            <div className="space-y-3">
              {draft.education.map((edu, i) => (
                <ListItemCard key={i} onRemove={() => patch({ education: draft.education.filter((_, idx) => idx !== i) })} title="education">
                  <Field label="Degree">
                    <Input
                      value={edu.degree}
                      onChange={(e) => setEducation(i, { degree: e.target.value })}
                      placeholder="e.g. Bachelor of Science"
                    />
                  </Field>
                  <Field label="Field of study">
                    <Input
                      value={edu.field}
                      onChange={(e) => setEducation(i, { field: e.target.value })}
                      placeholder="e.g. Computer Science"
                    />
                  </Field>
                  <Field label="School" className="sm:col-span-2">
                    <Input
                      value={edu.school}
                      onChange={(e) => setEducation(i, { school: e.target.value })}
                      placeholder="University or institute"
                    />
                  </Field>
                  <Field label="Start year">
                    <Input value={edu.from} onChange={(e) => setEducation(i, { from: e.target.value })} placeholder="2020" />
                  </Field>
                  <Field label="End year">
                    <Input
                      value={edu.current ? "" : edu.to}
                      onChange={(e) => setEducation(i, { to: e.target.value, current: false })}
                      placeholder="2024"
                      disabled={edu.current}
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={!!edu.current}
                      onChange={(e) => setEducation(i, { current: e.target.checked, to: e.target.checked ? "" : edu.to })}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    Currently studying
                  </label>
                </ListItemCard>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ education: [...draft.education, { ...emptyEducation }] })}
              >
                <Plus className="h-4 w-4" />
                Add education
              </Button>
            </div>
          </SectionCard>

          {/* Experience */}
          <SectionCard icon={<Briefcase className="h-5 w-5" />} title="Work experience" hint="Jobs, internships and volunteer work">
            <div className="space-y-3">
              {draft.experience.map((exp, i) => (
                <ListItemCard key={i} onRemove={() => patch({ experience: draft.experience.filter((_, idx) => idx !== i) })} title="experience">
                  <Field label="Role">
                    <Input
                      value={exp.role}
                      onChange={(e) => setExperience(i, { role: e.target.value })}
                      placeholder="e.g. Frontend developer"
                    />
                  </Field>
                  <Field label="Company / organization">
                    <Input
                      value={exp.company}
                      onChange={(e) => setExperience(i, { company: e.target.value })}
                      placeholder="e.g. Kabul Tech Hub"
                    />
                  </Field>
                  <Field label="Start">
                    <Input value={exp.from} onChange={(e) => setExperience(i, { from: e.target.value })} placeholder="2022" />
                  </Field>
                  <Field label="End">
                    <Input
                      value={exp.current ? "" : exp.to}
                      onChange={(e) => setExperience(i, { to: e.target.value, current: false })}
                      placeholder="2024"
                      disabled={exp.current}
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={!!exp.current}
                      onChange={(e) => setExperience(i, { current: e.target.checked, to: e.target.checked ? "" : exp.to })}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    I currently work here
                  </label>
                  <Field label="Description" className="sm:col-span-2">
                    <Textarea
                      value={exp.description ?? ""}
                      onChange={(e) => setExperience(i, { description: e.target.value })}
                      placeholder="What did you achieve in this role?"
                      className="min-h-[90px]"
                    />
                  </Field>
                </ListItemCard>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ experience: [...draft.experience, { ...emptyExperience }] })}
              >
                <Plus className="h-4 w-4" />
                Add experience
              </Button>
            </div>
          </SectionCard>

          {/* Projects */}
          <SectionCard icon={<Rocket className="h-5 w-5" />} title="Projects" hint="Showcase work that proves your skills">
            <div className="space-y-3">
              {draft.projects.map((proj, i) => (
                <ListItemCard key={i} onRemove={() => patch({ projects: draft.projects.filter((_, idx) => idx !== i) })} title="project">
                  <Field label="Project name" className="sm:col-span-2">
                    <Input
                      value={proj.name}
                      onChange={(e) => setProject(i, { name: e.target.value })}
                      placeholder="e.g. E-learning platform for Dari students"
                    />
                  </Field>
                  <Field label="URL" className="sm:col-span-2">
                    <Input
                      value={proj.url ?? ""}
                      onChange={(e) => setProject(i, { url: e.target.value })}
                      placeholder="https://…"
                    />
                  </Field>
                  <Field label="Description" className="sm:col-span-2">
                    <Textarea
                      value={proj.description}
                      onChange={(e) => setProject(i, { description: e.target.value })}
                      placeholder="What did you build and what impact did it have?"
                      className="min-h-[90px]"
                    />
                  </Field>
                </ListItemCard>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ projects: [...draft.projects, { ...emptyProject }] })}
              >
                <Plus className="h-4 w-4" />
                Add project
              </Button>
            </div>
          </SectionCard>

          {/* Certificates & awards */}
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard icon={<FileText className="h-5 w-5" />} title="Certificates" hint="Courses and certifications">
              <div className="space-y-3">
                {draft.certificates.map((cert, i) => (
                  <ListItemCard key={i} onRemove={() => patch({ certificates: draft.certificates.filter((_, idx) => idx !== i) })} title="certificate">
                    <Field label="Name">
                      <Input
                        value={cert.name}
                        onChange={(e) => setCertificate(i, { name: e.target.value })}
                        placeholder="e.g. AWS Cloud Practitioner"
                      />
                    </Field>
                    <Field label="Issuer">
                      <Input
                        value={cert.issuer}
                        onChange={(e) => setCertificate(i, { issuer: e.target.value })}
                        placeholder="e.g. Amazon"
                      />
                    </Field>
                    <Field label="Year" className="sm:col-span-2">
                      <Input value={cert.year} onChange={(e) => setCertificate(i, { year: e.target.value })} placeholder="2023" />
                    </Field>
                  </ListItemCard>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => patch({ certificates: [...draft.certificates, { ...emptyCertificate }] })}
                >
                  <Plus className="h-4 w-4" />
                  Add certificate
                </Button>
              </div>
            </SectionCard>

            <SectionCard icon={<Award className="h-5 w-5" />} title="Awards" hint="Recognitions and achievements">
              <div className="space-y-3">
                {draft.awards.map((aw, i) => (
                  <ListItemCard key={i} onRemove={() => patch({ awards: draft.awards.filter((_, idx) => idx !== i) })} title="award">
                    <Field label="Name">
                      <Input
                        value={aw.name}
                        onChange={(e) => setAward(i, { name: e.target.value })}
                        placeholder="e.g. National Coding Olympiad"
                      />
                    </Field>
                    <Field label="Issuer">
                      <Input
                        value={aw.issuer}
                        onChange={(e) => setAward(i, { issuer: e.target.value })}
                        placeholder="e.g. Ministry of Education"
                      />
                    </Field>
                    <Field label="Year" className="sm:col-span-2">
                      <Input value={aw.year} onChange={(e) => setAward(i, { year: e.target.value })} placeholder="2022" />
                    </Field>
                  </ListItemCard>
                ))}
                <Button variant="outline" size="sm" onClick={() => patch({ awards: [...draft.awards, { ...emptyAward }] })}>
                  <Plus className="h-4 w-4" />
                  Add award
                </Button>
              </div>
            </SectionCard>
          </div>

          {/* Cover letter */}
          <SectionCard icon={<PencilLine className="h-5 w-5" />} title="Cover letter" hint="A saved letter you can reuse when applying">
            <Textarea
              value={draft.coverLetter ?? ""}
              onChange={(e) => patch({ coverLetter: e.target.value })}
              placeholder="Write a general cover letter that you can adapt for each application…"
            />
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Strength */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-bold">Profile strength</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0">
                <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
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
                <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold">{completion}%</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{firstName}, your profile is {completion < 50 ? "getting started" : completion < 80 ? "almost there" : "looking great"}.</p>
                <p className="mt-1">Complete the checklist to attract more employers.</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-border" />
                  )}
                  <span className={item.done ? "text-muted-foreground" : "font-medium"}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI resume review */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border border-border bg-gradient-to-b from-primary/5 to-transparent p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-500">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold">AI resume review</h2>
                <p className="text-xs text-muted-foreground">Instant feedback on your profile</p>
              </div>
            </div>

            {review.state === "idle" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Get a score, strengths and a prioritized list of improvements based on what you have filled in.
              </p>
            )}

            {review.state === "loading" && (
              <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing your profile…</p>
              </div>
            )}

            {review.state === "done" && review.result && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <span className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold",
                    review.result.score >= 80 ? "bg-emerald-500/15 text-emerald-500" : review.result.score >= 50 ? "bg-amber-500/15 text-amber-500" : "bg-rose-500/15 text-rose-500"
                  )}>
                    {review.result.score}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile score</p>
                    <p className="text-sm font-semibold leading-snug">{review.result.verdict}</p>
                  </div>
                </div>

                {review.result.strengths.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-500">Strengths</p>
                    <ul className="space-y-1.5">
                      {review.result.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {review.result.improvements.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-500">Improve next</p>
                    <ul className="space-y-1.5">
                      {review.result.improvements.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full" onClick={() => setReview({ state: "idle" })}>
                  Review again
                </Button>
              </div>
            )}

            {review.state === "idle" && (
              <Button variant="gradient" className="mt-4 w-full" onClick={runReview}>
                <Wand2 className="h-4 w-4" />
                Review my profile
              </Button>
            )}
          </motion.div>

          {/* Cover letter generator */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 text-teal-500">
                <Wand2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold">Cover letter generator</h2>
                <p className="text-xs text-muted-foreground">Draft a letter from your profile</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Target role">
                <Input value={letterRole} onChange={(e) => setLetterRole(e.target.value)} placeholder="e.g. Frontend developer" />
              </Field>
              <Field label="Company">
                <Input value={letterCompany} onChange={(e) => setLetterCompany(e.target.value)} placeholder="e.g. Roshan" />
              </Field>
              <Button variant="outline" className="w-full" onClick={generateLetter} disabled={letterLoading}>
                {letterLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {letterLoading ? "Generating…" : "Generate letter"}
              </Button>
            </div>

            {letter && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Draft</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={copyLetter}>
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        patch({ coverLetter: letter });
                        toast("Saved to your cover letter section", "success");
                      }}
                    >
                      Save to profile
                    </Button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 font-sans text-sm leading-relaxed text-foreground/90">
                  {letter}
                </pre>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
