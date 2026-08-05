import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { JobsExplorer } from "@/components/jobs/jobs-explorer";

export default function JobsPage() {
  return (
    <SiteLayout>
      <Suspense>
        <JobsExplorer scope="all" />
      </Suspense>
    </SiteLayout>
  );
}
