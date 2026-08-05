"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { categories, categoryLabels, experienceLabels, jobTypeLabels, provinces } from "@/lib/data/constants";
import type { ExperienceLevel, JobCategory, JobType } from "@/lib/types";

const categoryValues = categories.map((c) => c.id) as [JobCategory, ...JobCategory[]];
const typeValues = Object.keys(jobTypeLabels) as [JobType, ...JobType[]];
const experienceValues = Object.keys(experienceLabels) as [ExperienceLevel, ...ExperienceLevel[]];

const schema = z.object({
  title: z.string().min(5),
  category: z.enum(categoryValues),
  type: z.enum(typeValues),
  experience: z.enum(experienceValues),
  location: z.string().min(2),
  province: z.string().optional(),
  country: z.string().min(2),
  remote: z.boolean(),
  salaryMin: z.coerce.number().min(0),
  salaryMax: z.coerce.number().min(0),
  currency: z.string().min(1),
  salaryPeriod: z.enum(["monthly", "hourly", "yearly", "one-time"]),
  description: z.string().min(40),
  responsibilities: z.string(),
  requirements: z.string(),
  benefits: z.string(),
  education: z.string().optional(),
  workingHours: z.string().optional(),
  skills: z.string(),
  languageRequirements: z.string().optional(),
  deadline: z.string().min(1),
  positions: z.coerce.number().int().min(1),
  featured: z.boolean(),
  urgent: z.boolean(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
}

const splitLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const splitTags = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function PostJobModal({ open, onClose }: PostJobModalProps) {
  const { addJob } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      category: "remote",
      type: "full-time",
      experience: "mid",
      country: "Afghanistan",
      remote: true,
      salaryMin: 20000,
      salaryMax: 50000,
      currency: "AFN",
      salaryPeriod: "monthly",
      positions: 1,
      featured: false,
      urgent: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const companyId = currentUser?.companyId;
    if (!companyId) {
      toast("No company linked to this account", "error");
      return;
    }
    addJob({
      companyId,
      title: values.title,
      category: values.category,
      type: values.type,
      experience: values.experience,
      location: values.location,
      province: values.province || undefined,
      country: values.country,
      remote: values.remote,
      salaryMin: values.salaryMin,
      salaryMax: values.salaryMax,
      currency: values.currency,
      salaryPeriod: values.salaryPeriod,
      description: values.description,
      responsibilities: splitLines(values.responsibilities),
      requirements: splitLines(values.requirements),
      benefits: splitLines(values.benefits),
      education: values.education || undefined,
      workingHours: values.workingHours || undefined,
      skills: splitTags(values.skills),
      languageRequirements: values.languageRequirements ? splitTags(values.languageRequirements) : [],
      deadline: new Date(`${values.deadline}T23:59:59`).toISOString(),
      positions: values.positions,
      featured: values.featured,
      urgent: values.urgent,
      tags: values.tags ? splitTags(values.tags) : [],
      status: "open",
    });
    toast("Opportunity published!");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Post a new opportunity" description="Reach thousands of Afghan talents in minutes." className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input placeholder="e.g. Senior Frontend Developer" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">Title is required (min 5 characters)</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select {...register("category")}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{categoryLabels[c.id]}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select {...register("type")}>
              {(Object.entries(jobTypeLabels) as [JobType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Experience</Label>
            <Select {...register("experience")}>
              {(Object.entries(experienceLabels) as [ExperienceLevel, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input placeholder="e.g. Kabul" {...register("location")} />
          </div>
          <div className="space-y-2">
            <Label>Province</Label>
            <Select {...register("province")}>
              <option value="">Any / Remote</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...register("country")} />
          </div>
          <div className="space-y-2">
            <Label>Min salary</Label>
            <Input type="number" min={0} {...register("salaryMin")} />
          </div>
          <div className="space-y-2">
            <Label>Max salary</Label>
            <Input type="number" min={0} {...register("salaryMax")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select {...register("currency")}>
              <option value="AFN">AFN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pay period</Label>
            <Select {...register("salaryPeriod")}>
              <option value="monthly">Monthly</option>
              <option value="hourly">Hourly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One-time</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input type="date" {...register("deadline")} />
            {errors.deadline && <p className="text-xs text-destructive">Deadline is required</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea rows={4} placeholder="Describe the role, team and what makes it exciting…" {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">Description is required (min 40 characters)</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Responsibilities (one per line)</Label>
            <Textarea rows={4} placeholder={"Build features\nWrite tests\nMentor juniors"} {...register("responsibilities")} />
          </div>
          <div className="space-y-2">
            <Label>Requirements (one per line)</Label>
            <Textarea rows={4} placeholder={"3+ years experience\nFluent English"} {...register("requirements")} />
          </div>
          <div className="space-y-2">
            <Label>Benefits (one per line)</Label>
            <Textarea rows={4} placeholder={"Remote work\nHealth insurance"} {...register("benefits")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Education (optional)</Label>
            <Input placeholder="e.g. Bachelor in Computer Science" {...register("education")} />
          </div>
          <div className="space-y-2">
            <Label>Working hours (optional)</Label>
            <Input placeholder="e.g. 9:00 – 17:00" {...register("workingHours")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Skills (comma separated)</Label>
            <Input placeholder="React, TypeScript, Docker" {...register("skills")} />
            {errors.skills && <p className="text-xs text-destructive">At least one skill is required</p>}
          </div>
          <div className="space-y-2">
            <Label>Language requirements (comma separated)</Label>
            <Input placeholder="English, Dari" {...register("languageRequirements")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Open positions</Label>
            <Input type="number" min={1} {...register("positions")} />
          </div>
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input placeholder="startup, fintech" {...register("tags")} />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" {...register("featured")} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" {...register("urgent")} />
              Urgent
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish opportunity
          </Button>
        </div>
      </form>
    </Modal>
  );
}
