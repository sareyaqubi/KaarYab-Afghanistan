import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { RoleGate } from "@/components/auth/role-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard — KaarYab Afghanistan",
};

export default function DashboardPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense>
          <RoleGate roles={["applicant", "employer", "admin"]}>
            <DashboardShell />
          </RoleGate>
        </Suspense>
      </div>
    </SiteLayout>
  );
}
