"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, FileUp, Loader2, Send } from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { useI18n } from "@/providers/i18n";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Job } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  cv: z.string().optional(),
  coverLetter: z.string().max(3000).optional(),
  portfolio: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  message: z.string().max(3000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: Job;
  employerId: string;
}

export function ApplyModal({ open, onClose, job, employerId }: ApplyModalProps) {
  const { t } = useI18n();
  const { applyToJob } = useData();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [fileName, setFileName] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.applicantProfile?.phone ?? "",
      coverLetter: currentUser?.applicantProfile?.coverLetter ?? "",
      portfolio: currentUser?.applicantProfile?.portfolio ?? "",
      github: currentUser?.applicantProfile?.github ?? "",
      linkedin: currentUser?.applicantProfile?.linkedin ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast(t("app.mustLogin"), "info");
      onClose();
      router.push("/login");
      return;
    }
    applyToJob({
      jobId: job.id,
      applicantId: currentUser.id,
      employerId,
      cvUrl: fileName ? `cv://${fileName}` : currentUser?.applicantProfile?.cvUrl,
      coverLetter: values.coverLetter || values.message,
      portfolio: values.portfolio,
      github: values.github,
      linkedin: values.linkedin,
      phone: values.phone,
      email: values.email,
      message: values.message,
    });
    setSubmitted(true);
    toast(t("app.appliedSuccess"));
  };

  const closeAll = () => {
    setSubmitted(false);
    setFileName(undefined);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={closeAll}
      title={submitted ? undefined : t("app.applyTitle")}
      description={submitted ? undefined : `${job.title}`}
      className="max-w-2xl"
      hideClose={submitted}
    >
      {submitted ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          <h3 className="mt-4 text-xl font-bold">{t("app.appliedSuccess")}</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("app.appliedSuccessHint")}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={closeAll}>
              {t("common.close")}
            </Button>
            <Button variant="gradient" onClick={() => router.push("/dashboard")}>
              {t("nav.dashboard")}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="app-name">{t("app.fullName")}</Label>
              <Input id="app-name" {...register("name")} aria-invalid={!!errors.name} />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{t("auth.errors.required")}</p>}
            </div>
            <div>
              <Label htmlFor="app-phone">{t("app.phone")}</Label>
              <Input id="app-phone" placeholder="+93 700 000 000" {...register("phone")} aria-invalid={!!errors.phone} />
              {errors.phone && <p className="mt-1 text-xs text-rose-500">{t("auth.errors.required")}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="app-email">{t("auth.email")}</Label>
            <Input id="app-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{t("auth.errors.invalidEmail")}</p>}
          </div>

          {/* CV upload */}
          <div>
            <Label>{t("app.cv")}</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
              <FileUp className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-semibold">
                {fileName ?? t("app.upload")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("app.dragDrop")} — {t("app.fileTypes")}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name)}
              />
            </label>
          </div>

          <div>
            <Label htmlFor="app-cover">{t("app.coverLetter")}</Label>
            <Textarea
              id="app-cover"
              placeholder={t("app.coverLetterPlaceholder")}
              {...register("coverLetter")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="app-portfolio">{t("app.portfolio")}</Label>
              <Input id="app-portfolio" placeholder="https://..." {...register("portfolio")} />
              {errors.portfolio && <p className="mt-1 text-xs text-rose-500">Invalid URL</p>}
            </div>
            <div>
              <Label htmlFor="app-github">{t("app.github")}</Label>
              <Input id="app-github" placeholder="https://github.com/..." {...register("github")} />
              {errors.github && <p className="mt-1 text-xs text-rose-500">Invalid URL</p>}
            </div>
            <div>
              <Label htmlFor="app-linkedin">{t("app.linkedin")}</Label>
              <Input id="app-linkedin" placeholder="https://linkedin.com/..." {...register("linkedin")} />
              {errors.linkedin && <p className="mt-1 text-xs text-rose-500">Invalid URL</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="app-message">{t("app.coverLetterPlaceholder")}</Label>
            <Textarea id="app-message" placeholder={t("app.coverLetterPlaceholder")} {...register("message")} />
          </div>

          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("app.submit")}
          </Button>
        </form>
      )}
    </Modal>
  );
}
