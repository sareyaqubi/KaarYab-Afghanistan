"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote, TrendingUp } from "lucide-react";
import { useI18n } from "@/providers/i18n";

const stories = [
  {
    name: "Fatima Rahimi",
    role: "UI/UX Designer → TechNation",
    quote:
      "I applied through KaarYab and got a remote design role within two weeks. The application was so simple, and the employer replied the same day.",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Fatima",
    growth: "+180%",
  },
  {
    name: "Omid Stanikzai",
    role: "CS Student → Full Scholarship",
    quote:
      "I found a full software engineering scholarship through KaarYab that changed my life. I never knew these opportunities existed.",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Omid",
    growth: "Scholarship",
  },
  {
    name: "Nilab Wardak",
    role: "Freelancer → $1,200/mo",
    quote:
      "The freelance opportunities on KaarYab connected me with international clients. My monthly income doubled in three months.",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Nilab",
    growth: "+$900/mo",
  },
];

export function SuccessStoriesSection() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("successStories")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("successStoriesSubtitle")}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stories.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-soft"
          >
            <Quote className="h-7 w-7 text-primary/40" />
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{s.quote}&rdquo;</p>
            <div className="flex items-center justify-between border-t border-border/70 pt-4">
              <div className="flex items-center gap-3">
                <Image
                  src={s.avatar}
                  alt={s.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full ring-2 ring-border"
                />
                <div>
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                {s.growth}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
