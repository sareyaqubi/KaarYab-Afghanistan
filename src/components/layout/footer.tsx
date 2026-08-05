"use client";

import Link from "next/link";
import { Globe, Mail, MessageCircle, Rss } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/providers/i18n";

const socials = [
  { icon: <Globe className="h-4 w-4" />, label: "Website" },
  { icon: <Mail className="h-4 w-4" />, label: "Email" },
  { icon: <MessageCircle className="h-4 w-4" />, label: "Community" },
  { icon: <Rss className="h-4 w-4" />, label: "Blog" },
];

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.about")}
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title={t("footer.product")}
            links={[
              { label: t("footer.remoteJobs"), href: "/jobs?category=remote" },
              { label: t("footer.onSiteJobs"), href: "/jobs?category=on-site" },
              { label: t("nav.companies"), href: "/companies" },
              { label: t("footer.pricing"), href: "#" },
            ]}
          />
          <FooterCol
            title={t("footer.resources")}
            links={[
              { label: t("footer.careerTips"), href: "/blog" },
              { label: t("footer.blog"), href: "/blog" },
              { label: t("footer.resumeBuilder"), href: "/tools/resume-builder" },
              { label: t("footer.helpCenter"), href: "#" },
            ]}
          />
          <FooterCol
            title={t("footer.company")}
            links={[
              { label: t("footer.aboutUs"), href: "#" },
              { label: t("footer.contact"), href: "#" },
              { label: t("footer.privacy"), href: "#" },
              { label: t("footer.terms"), href: "#" },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {t("brand")}.af — {t("footer.rights")}
          </p>
          <p className="flex items-center gap-1.5">
            Made with <span className="text-rose-500">♥</span> for Afghanistan
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
