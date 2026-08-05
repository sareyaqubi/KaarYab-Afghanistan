"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, Search, Sparkles, Users, TrendingUp } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { useData } from "@/providers/data";
import { companies as staticCompanies } from "@/lib/data/companies";

const popular = [
  { label: "Remote Jobs", query: "category=remote" },
  { label: "Internships", query: "category=internship" },
  { label: "Scholarships", query: "category=scholarship" },
  { label: "Freelance", query: "category=freelance" },
];

export function HeroSection() {
  const { t } = useI18n();
  const router = useRouter();
  const { jobs } = useData();
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/jobs?q=${encodeURIComponent(query)}`);
  };

  const liveJobs = jobs.filter((j) => j.status === "open").length;
  const companiesCount = staticCompanies.length;

  return (
    <section className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-100px] top-40 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--muted-foreground) 18%, transparent) 1px, transparent 0)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {t("hero.title1")}{" "}
            <span className="gradient-text">{t("hero.titleHighlight")}</span>{" "}
            {t("hero.title2")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Animated search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            onSubmit={submit}
            className="glass-strong mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl p-2 shadow-soft sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl px-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("hero.searchPlaceholder")}
                aria-label={t("hero.searchPlaceholder")}
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <button
              type="submit"
              className="gradient-brand group flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-md shadow-teal-500/25 transition-all hover:brightness-110"
            >
              {t("hero.searchButton")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <span>{t("hero.popular")}</span>
            {popular.map((p) => (
              <a
                key={p.label}
                href={`/jobs?${p.query}`}
                className="rounded-full border border-border bg-card px-3 py-1 font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                {p.label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <Stat icon={<Briefcase className="h-5 w-5" />} value={String(liveJobs)} label={t("hero.statsJobs")} />
          <Stat icon={<Building2 className="h-5 w-5" />} value={`${companiesCount}+`} label={t("hero.statsCompanies")} />
          <Stat icon={<Users className="h-5 w-5" />} value="12,000+" label={t("hero.statsUsers")} />
          <Stat icon={<TrendingUp className="h-5 w-5" />} value="4,800+" label={t("hero.statsHires")} />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="glass flex flex-col items-center gap-1 rounded-2xl px-4 py-5 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="mt-1 text-2xl font-extrabold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
