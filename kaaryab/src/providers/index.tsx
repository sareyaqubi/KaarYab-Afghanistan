"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme";
import { I18nProvider } from "./i18n";
import { AuthProvider } from "./auth";
import { DataProvider } from "./data";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>{children}</DataProvider>
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
