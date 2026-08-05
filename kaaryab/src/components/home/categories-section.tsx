"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Globe,
  GraduationCap,
  HeartHandshake,
  Presentation,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { categories, categoryLabels } from "@/lib/data/constants";
import type { JobCategory } from "@/lib/types";
import { useI18n } from "@/providers/i18n";
import { useData } from "@/providers/data";

const iconMap: Record<string, LucideIcon> = {
  globe: Globe,
  building: Building2,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  award: Award,
  "heart-handshake": HeartHandshake,
  presentation: Presentation,
  "book-open": BookOpen,
  briefcase: Briefcase,
  trophy: Trophy,
};

export function CategoriesSection() {
  const { t } = useI18n();
  const { jobs } = useData();

  const counts = (id: JobCategory) => jobs.filter((j) => j.category === id && j.status !== "archived").length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("categoriesTitle")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("categoriesSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon] ?? Briefcase;
          const count = counts(cat.id);
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Link
                href={`/jobs?category=${cat.id}`}
                className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
              >
                <div
                  className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25"
                  style={{ backgroundColor: cat.color }}
                />
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold tracking-tight">{categoryLabels[cat.id]}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{count} opportunities</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
