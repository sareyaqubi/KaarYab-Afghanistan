import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { JobDetails } from "@/components/jobs/job-details";
import { jobs } from "@/lib/data/jobs";
import { companies } from "@/lib/data/companies";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) return { title: "Job not found — KaarYab Afghanistan" };
  const company = companies.find((c) => c.id === job.companyId);
  return {
    title: `${job.title} — ${company?.name ?? "KaarYab Afghanistan"}`,
    description: job.description,
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;
  return (
    <SiteLayout>
      <Suspense>
        <JobDetails jobId={id} />
      </Suspense>
    </SiteLayout>
  );
}
