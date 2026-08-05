"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useData } from "@/providers/data";
import { useAuth } from "@/providers/auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import { formatRelativeTime } from "@/lib/utils";

export function NotificationsDropdown() {
  const { notifications, markNotificationsRead, markNotificationRead } = useData();
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  if (!currentUser) return null;
  const mine = notifications.filter((n) => n.userId === currentUser.id);
  const unread = mine.filter((n) => !n.read).length;

  const openDropdown = () => {
    setOpen((o) => !o);
    if (!open) setTimeout(() => markNotificationsRead(currentUser.id), 600);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openDropdown}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-pulse-dot items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            className="glass-strong absolute right-0 z-50 mt-2 max-h-[420px] w-80 overflow-y-auto rounded-2xl p-2 shadow-xl sm:w-96"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-bold">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={() => markNotificationsRead(currentUser.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {mine.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto mb-2 h-8 w-8 opacity-40" />
                No notifications yet
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {mine.slice(0, 30).map((n) => (
                  <a
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => markNotificationRead(n.id)}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.read ? "bg-transparent" : "bg-primary animate-pulse-dot"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/60">
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
