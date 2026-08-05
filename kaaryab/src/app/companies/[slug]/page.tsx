import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SiteLayout } from "@/components/layout/site-layout";
import { CompanyProfile } from "@/components/companies/company-profile";
import { companies } from "@/lib/data/companies";

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = companies.find((c) => c.slug === slug);
  if (!company) return { title: "Company not found — KaarYab Afghanistan" };
  return {
    title: `${company.name} — KaarYab Afghanistan`,
    description: company.description,
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const exists = companies.some((c) => c.slug === slug);
  if (!exists) notFound();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense>
          <CompanyProfile slug={slug} />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
