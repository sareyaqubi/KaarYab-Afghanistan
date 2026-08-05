"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/types";
import { dictionaries, en, type DeepKeys, type Dict } from "@/i18n/translations";
import { load, save } from "@/lib/storage";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DeepKeys<Dict>, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

function translate(key: DeepKeys<Dict>, dict: Dict, vars?: Record<string, string | number>): string {
  const resolve = (d: Record<string, unknown>): unknown => {
    return key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, d);
  };
  let str =
    (resolve(dict as unknown as Record<string, unknown>) as string | undefined) ??
    (resolve(en as unknown as Record<string, unknown>) as string | undefined) ??
    key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  dir: "ltr",
  t: (key, vars) => translate(key, en, vars),
});

const RTL_LANGS: Lang[] = ["fa", "ps"];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = load<Lang | null>("kaaryab:lang", null);
    return stored === "fa" || stored === "ps" || stored === "en" ? stored : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    save("kaaryab:lang", l);
  };

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[lang] ?? en;
    return {
      lang,
      setLang,
      dir: RTL_LANGS.includes(lang) ? "rtl" : "ltr",
      t: (key, vars) => translate(key, dict, vars),
    };
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = value.dir;
  }, [lang, value.dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
