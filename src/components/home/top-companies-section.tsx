"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Users } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { useData } from "@/providers/data";
import { RatingStars } from "@/components/ui/rating-stars";

export function TopCompaniesSection() {
  const { t } = useI18n();
  const { companies, jobs } = useData();

  const top = [...companies]
    .sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || b.rating - a.rating)
    .slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("topCompanies")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("topCompaniesSubtitle")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((company, i) => {
            const openJobs = jobs.filter((j) => j.companyId === company.id && j.status === "open").length;
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/companies/${company.slug}`}
                  className="group relative flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
                >
                  {company.verified && (
                    <span className="absolute right-4 top-4 text-primary">
                      <BadgeCheck className="h-5 w-5" />
                    </span>
                  )}
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={64}
                    height={64}
                    className="rounded-2xl ring-1 ring-border transition-transform group-hover:scale-105"
                  />
                  <div>
                    <h3 className="font-bold tracking-tight group-hover:text-primary">{company.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{company.industry}</p>
                    <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {company.province}
                    </p>
                  </div>
                  <RatingStars value={company.rating} count={company.ratingCount} />
                  <div className="flex items-center justify-center gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {company.followers.length} followers
                    </span>
                    <span className="font-semibold text-primary">{openJobs} open</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
