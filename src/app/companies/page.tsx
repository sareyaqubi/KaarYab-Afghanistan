import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { CompaniesPage } from "@/components/companies/companies-page";

export const metadata: Metadata = {
  title: "Companies — KaarYab Afghanistan",
  description: "Explore Afghanistan's leading employers, read verified reviews and find open opportunities.",
};

export default function CompaniesRoute() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense>
          <CompaniesPage />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
