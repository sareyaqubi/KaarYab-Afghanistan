import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { JobsExplorer } from "@/components/jobs/jobs-explorer";

export const metadata = {
  title: "On-site Jobs in Afghanistan — KaarYab",
  description: "Browse on-site jobs across Kabul, Herat, Kandahar, Balkh and all provinces of Afghanistan.",
};

export default function OnSiteJobsPage() {
  return (
    <SiteLayout>
      <Suspense>
        <JobsExplorer scope="onsite" />
      </Suspense>
    </SiteLayout>
  );
}
