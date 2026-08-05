"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/providers/i18n";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";

const testimonials = [
  {
    name: "Omid Stanikzai",
    role: "Scholarship Recipient, Kabul",
    quote:
      "KaarYab made finding scholarships effortless. I went from searching Facebook groups to having a clear list of opportunities with real deadlines.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Omid",
  },
  {
    name: "Sahar Azizi",
    role: "HR Manager, Roshan",
    quote:
      "We cut our hiring time in half. Applications arrive organized, we can interview in one click, and the candidates are high quality.",
    rating: 5,
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sahar",
  },
  {
    name: "Bilal Haidari",
    role: "Remote Developer",
    quote:
      "I landed my first remote job with an international company through KaarYab. The smart ranking actually surfaced the best matches for me.",
    rating: 4.5,
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Bilal",
  },
];

export function TestimonialsSection() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("testimonials")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("testimonialsSubtitle")}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((tm, i) => (
          <motion.div
            key={tm.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
          >
            <RatingStars value={tm.rating} />
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{tm.quote}&rdquo;</p>
            <div className="flex items-center gap-3 border-t border-border/70 pt-4">
              <Avatar name={tm.name} src={tm.avatar} size="sm" />
              <div>
                <p className="text-sm font-bold">{tm.name}</p>
                <p className="text-xs text-muted-foreground">{tm.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
