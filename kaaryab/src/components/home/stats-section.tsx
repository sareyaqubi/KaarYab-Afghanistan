"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useI18n } from "@/providers/i18n";

const data = [
  { month: "Jan", applications: 420, hires: 65 },
  { month: "Feb", applications: 540, hires: 82 },
  { month: "Mar", applications: 610, hires: 96 },
  { month: "Apr", applications: 780, hires: 118 },
  { month: "May", applications: 910, hires: 141 },
  { month: "Jun", applications: 1040, hires: 168 },
  { month: "Jul", applications: 1280, hires: 210 },
];

const stats = [
  { value: "4,800+", label: "Successful hires" },
  { value: "12,000+", label: "Active job seekers" },
  { value: "40+", label: "Partner companies" },
  { value: "95%", label: "Satisfaction rate" },
];

export function StatsSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("statsTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("statsSubtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
          >
            <p className="text-sm font-semibold text-muted-foreground">Growth in 2026</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gradApps)" name="Applications" />
                  <Area type="monotone" dataKey="hires" stroke="#6366f1" strokeWidth={2} fill="transparent" name="Hires" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 lg:col-span-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-soft"
              >
                <span className="gradient-text text-4xl font-extrabold sm:text-5xl">{s.value}</span>
                <span className="mt-2 text-sm text-muted-foreground">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
