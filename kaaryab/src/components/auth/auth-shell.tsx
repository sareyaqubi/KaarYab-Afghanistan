"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Sparkles } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const bullets = [
  { title: "4,800+ placements", desc: "Real opportunities across Afghanistan" },
  { title: "Top employers", desc: "Roshan, Netlinks, UNICEF & more" },
  { title: "Apply in minutes", desc: "No paperwork. Track everything online" },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="gradient-brand absolute inset-0" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">KaarYab.af</span>
          </Link>
        </div>
        <div className="relative text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-5 max-w-md text-3xl font-extrabold leading-tight">
            Build your career with Afghanistan&apos;s smartest opportunity platform.
          </h2>
          <ul className="mt-8 space-y-4">
            {bullets.map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-white/80" />
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-white/75">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/70">
          © {new Date().getFullYear()} KaarYab Afghanistan — {t("brandTagline")}
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between p-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
