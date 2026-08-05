"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/providers/i18n";
import { useAuth } from "@/providers/auth";
import { useData } from "@/providers/data";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsDropdown } from "./notifications-dropdown";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, MessageCircle, User as UserIcon, X } from "lucide-react";

export function Navbar() {
  const { t } = useI18n();
  const { currentUser, logout } = useAuth();
  const { conversations } = useData();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useClickOutside<HTMLDivElement>(() => setUserOpen(false));

  const unreadMessages =
    currentUser && conversations
      ? conversations.reduce((acc, c) => {
          const unread = c.messages.filter(
            (m) => m.senderId !== currentUser.id && !m.readBy.includes(currentUser.id)
          ).length;
          return acc + unread;
        }, 0)
      : 0;

  const links = [
    { label: t("nav.remoteJobs"), href: "/jobs?category=remote" },
    { label: t("nav.onSiteJobs"), href: "/jobs?category=on-site" },
    { label: t("nav.companies"), href: "/companies" },
    { label: t("nav.blog"), href: "/blog" },
  ];

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  const roleLabels: Record<string, string> = {
    guest: "Guest",
    applicant: t("common.applicant"),
    employer: t("common.employer"),
    admin: t("common.admin"),
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />

          {currentUser ? (
            <>
              <NotificationsDropdown />
              <a
                href="/messages"
                className="relative hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
                aria-label={t("nav.messages")}
              >
                <MessageCircle className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </a>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="ml-1 flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted"
                  aria-label="Account menu"
                  aria-expanded={userOpen}
                >
                  <Avatar
                    name={currentUser.name}
                    src={currentUser.applicantProfile?.photo}
                    size="sm"
                  />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="glass-strong absolute right-0 mt-2 w-64 rounded-2xl p-2 shadow-xl"
                    >
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate text-sm font-semibold">{currentUser.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
                        <Badge className="mt-1.5" variant="secondary">
                          {roleLabels[currentUser.role] ?? currentUser.role}
                        </Badge>
                      </div>
                      <div className="pt-1.5">
                        <MenuItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label={t("nav.dashboard")} onClick={() => setUserOpen(false)} />
                        <MenuItem href="/profile" icon={<UserIcon className="h-4 w-4" />} label={t("common.profile")} onClick={() => setUserOpen(false)} />
                        <MenuItem href="/messages" icon={<MessageCircle className="h-4 w-4" />} label={t("nav.messages")} onClick={() => setUserOpen(false)} />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-destructive/10"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("nav.logout")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() => router.push("/login")}
              >
                {t("nav.login")}
              </Button>
              <Button variant="gradient" onClick={() => router.push("/register")}>
                {t("nav.register")}
              </Button>
            </>
          )}

          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/70 lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              {!currentUser && (
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/login");
                    }}
                  >
                    {t("nav.login")}
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/register");
                    }}
                  >
                    {t("nav.register")}
                  </Button>
                </div>
              )}
              {currentUser && (
                <a
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t("nav.dashboard")}
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </a>
  );
}
