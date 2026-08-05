"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Languages } from "lucide-react";
import { useI18n } from "@/providers/i18n";
import type { Lang } from "@/lib/types";
import { useClickOutside } from "@/hooks/use-click-outside";

const options: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fa", label: "دری" },
  { value: "ps", label: "پښتو" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const current = options.find((o) => o.value === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{current?.label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="glass-strong absolute right-0 z-50 mt-2 w-36 rounded-xl p-1.5 shadow-xl"
          >
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  setLang(o.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <span>{o.label}</span>
                {lang === o.value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
