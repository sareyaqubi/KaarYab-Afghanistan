import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { JobsExplorer } from "@/components/jobs/jobs-explorer";

export const metadata = {
  title: "Remote Jobs in Afghanistan — KaarYab",
  description: "Browse remote jobs, freelance gigs and online opportunities for Afghan talent worldwide.",
};

export default function RemoteJobsPage() {
  return (
    <SiteLayout>
      <Suspense>
        <JobsExplorer scope="remote" />
      </Suspense>
    </SiteLayout>
  );
}
