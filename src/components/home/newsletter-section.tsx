"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Send, Sparkles } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setDone(true);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="gradient-brand relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-soft sm:px-14"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Mail className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("newsletterTitle")}</h2>
          <p className="mx-auto mt-3 text-sm text-white/85 sm:text-base">{t("newsletterSubtitle")}</p>

          {done ? (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-4 font-semibold backdrop-blur">
              <CheckCircle2 className="h-5 w-5" />
              {t("newsletterSuccess")}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/95 px-4">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletterPlaceholder")}
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  aria-label={t("newsletterPlaceholder")}
                />
              </div>
              <Button type="submit" variant="secondary" size="lg" className="h-12 shrink-0 text-slate-900">
                <Send className="h-4 w-4" />
                {t("newsletterButton")}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export function CTASection() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-2xl">
          <span className="glass mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-primary">
            <Sparkles className="h-7 w-7" />
          </span>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{t("ctaSubtitle")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="gradient" size="lg" onClick={() => router.push("/register")}>
              {t("ctaPrimary")}
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/jobs")}>
              {t("ctaSecondary")}
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
